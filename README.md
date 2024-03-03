## Serve locally

In the `services/app` run:

```sh
npm run dev
```

In the `services/server` run:

```sh
npm start
```

## Deploy

In the deploy folder run:

```sh
npm cdk deploy
```

## Technical background

The app is hosted on S3 and can be reached on this URL: https://dodo-app.niclas.tech.
The server is deployed via CDK to a Fargate service in AWS and is reachable here: https://dodo.niclas.tech and here wss://dodo.niclas.tech

I chose tailwind because it personally goes faster developing that way and it's not fun to write css. I'm deploying the app with Vite because it's fast and almost no config. Error handling is a little sparse as it's very much a design desision how to show it and I didn't have much time to go through all possible errors. Apart from that I enjoyed spending some time learning HTML5 drag-and-drop and socket.io which are featured heavily in this project.

## User stories

This application aims to solve these user stories:

- I as a user can create to-do items
- I as another user can collaborate in real-time with other users
- I as a user can mark items as done
- I as a user can make subtasks to my to items
- I as a user can make infinite nested levels of subtasks
- I as a user can create multiple to-do lists that can be shared
- I as a user can change the order of the list with drag-and-drop
- I as a user can move/convert subtasks to tasks or the reversed via drag-and-drop
