import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { userRouter } from './router/userRoute';
import { postRouter } from './router/postRoute';


const app = new Hono()

app.use(cors());

app.route("api/v1/users",userRouter);
app.route("api/v1/post", postRouter);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
