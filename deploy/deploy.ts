import { App, Environment, Tags } from "aws-cdk-lib";
import ServerStack from "./lib/ServerStack";
import InfraStack from "./lib/InfraStack";
import StaticAppStack from "./lib/StaticAppStack";

const app = new App();
const env: Environment = { region: "eu-north-1" };

const infra = new InfraStack(app, "InfraStack", { env });
Tags.of(infra).add("service", "dodo-infra");

const serverStack = new ServerStack(app, "ServerStack", {
  env,
  cluster: infra.cluster,
  todoListTable: infra.todoListTable,
  todoTaskTable: infra.todoTaskTable,
});
Tags.of(serverStack).add("service", "dodo-server");

const appStack = new StaticAppStack(app, "AppStack", { env: app });
Tags.of(appStack).add("service", "dodo-server");
