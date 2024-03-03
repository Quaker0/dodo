import { App, Environment, Tags } from "aws-cdk-lib";
import ServerStack from "./lib/ServerStack";
import InfraStack from "./lib/InfraStack";

const app = new App();
const env: Environment = { region: "us-east-1" };

const infra = new InfraStack(app, "InfraStack", { env });
Tags.of(infra).add("service", "dodo-infra");

const serverStack = new ServerStack(app, "ServerStack", {
  env,
  cluster: infra.cluster,
});
Tags.of(serverStack).add("service", "dodo-server");
