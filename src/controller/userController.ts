import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { Context } from "hono";
import { signinSchema, signupSchema } from "../zod/userZod";
import { Jwt } from "hono/utils/jwt";
import { sign } from "hono/jwt";

export async function signup(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body: {
        username: string,
        email: string,
        password: string
    } = await c.req.json();

    try {
        const parsePayload = signupSchema.safeParse(body);

        if (!parsePayload.success) {
            return c.body('Invalid input', 400)
        }

        const isUserExist = await prisma.users.findFirst({
            where: { email: body.email }
        });

        if (isUserExist) {
            return c.body('User already exist', 400)
        }

        const res = await prisma.users.create({
            data: {
                username: body.username,
                email: body.email,
                password: body.password,
            }
        })

        const userId = res.id;

        const token = await sign({ id: userId }, c.env.JWT_TOKEN)

        return c.json({
            msg: "signup successfull",
            token: token,
            user: {
                userId: res.id,
                username: res.username,
                email: res.email,
            }
        })
    }
    catch (error) {
        return c.body(`Internal server error: ${error}`, 500)
    }
}


export async function signin(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body: {
        email: string,
        password: string
    } = await c.req.json();

    try {
        const parsePayload = signinSchema.safeParse(body);

        if (!parsePayload.success) {
            return c.body('invalid input', 400);
        }

        const isUserExist = await prisma.users.findFirst({
            where: {
                email: body.email,
                password: body.password,
            }
        });

        if (isUserExist == null) {
            return c.body('User doesnot exist', 402)
        }

        const userId = isUserExist?.id;
        const token = await sign({ id: userId }, c.env.JWT_TOKEN);

        return c.json({
            msg: "signin successfull",
            token: token,
            user: {
                userId: userId,
                username: isUserExist.username,
                email: isUserExist.email
            }
        });
    }
    catch (error) {
        return c.body(`Internal serer error: ${error}`, 500)
    }
}