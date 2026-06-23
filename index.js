import fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyView from "@fastify/view";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyPassport from "@fastify/passport";

import Account from "./models/Account.js";

import handlebars from "handlebars";
import "dotenv/config";

const app = fastify();
const PORT = process.env.PORT || 3000;

await app.register(fastifyFormbody);
await app.register(fastifyView, {
  engine: { handlebars },
  root: "views",
});

await app.register(fastifyCookie);
await app.register(fastifySession, {
  secret: process.env.SECRET,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  },
  saveUninitialized: false,
  resave: false,
});

await app.register(fastifyPassport.initialize());
await app.register(fastifyPassport.secureSession());

fastifyPassport.registerUserSerializer(async (user, request) => user.username);
fastifyPassport.registerUserDeserializer(async (username, request) => {
  const account = await Account.findByUsername(username);
  if (!account) {
    throw new Error("User not found");
  }
  return account;
});

fastifyPassport.use("local", Account.genStrategy());
fastifyPassport.use("jwt", Account.genJWTStrategy());

const loginFormVars = {
  signup: {
    title: "Sign up",
    message: "Already have an account?",
    route: "/account",
    switchPage: "login",
    showExtraFields: true,
  },
  login: {
    title: "Log in",
    message: "Need to create an account",
    route: "/auth",
    switchPage: "signup",
    showExtraFields: false,
  },
};

app.get("/", async (request, reply) => {
  const { page } = request.query;
  const formVars = loginFormVars[page] || loginFormVars.login;
  return reply.view("index", formVars);
});

app.post("/account", async (request, reply) => {
  const { username, password, confirmPassword } = request.body;

  if (!password || !confirmPassword) {
    return reply
      .code(400)
      .send({ message: "Password and confirm password are required." });
  }

  if (password !== confirmPassword) {
    return reply.code(400).send({ message: "Passwords do not match." });
  }

  try {
    const user = await Account.register(username, password);
    await request.login(user);
    return reply.redirect("/dashboard");
  } catch (e) {
    return reply.code(400).send({
      message: "Account creation failed.",
      error: e.message,
    });
  }
});

app.post("/auth", async (request, reply) => {
  try {
    await fastifyPassport.authenticate("local", { authInfo: false })(
      request,
      reply,
    );
    if (request.user) {
      const { username } = request.user;
      return reply.redirect("/dashboard");
    }
  } catch (e) {
    return reply.code(401).send({
      message: "Authenticate failed.",
      error: "Invalid username or password.",
    });
  }
});

app.get("/logout", async (request, reply) => {
  try {
    await request.logout();
    return reply.redirect("/?page=login");
  } catch (err) {
    return reply.code(500).send({ message: "Error logout" });
  }
});

app.get("/dashboard", async (request, reply) => {
  if (!request.isAuthenticated()) {
    return reply.redirect("/?page=login");
  }

  const { username } = request.user;
  return reply.view("dashboard", { username });
});

app.post(
  "/api/auth",
  { preValidation: fastifyPassport.authenticate("local", { session: false }) },
  async (request, reply) => {
    const { user: account } = request;
    const token = account.signJWT();
    return reply.send({ token });
  },
);

app.get(
  "/api/test",
  { preValidation: fastifyPassport.authenticate("jwt", { session: false }) },
  async (request, reply) => {
    return reply.send({ status: "Authenticated." });
  },
);

try {
  const address = await app.listen({ port: PORT, host: "127.0.0.1" });
  console.log(`App listening on ${address}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
