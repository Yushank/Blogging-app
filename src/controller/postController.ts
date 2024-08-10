import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { Context } from "hono";
import { number } from "zod";


export async function getPosts(c: Context) {
    const pirsma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const posts = await pirsma.posts.findMany({
            include: {
                user: true,
            }
        });

        return c.json({
            posts: posts.map((res) => ({
                id: res.id,
                username: res.user.username,
                userId: res.user.id,
                title: res.title,
                body: res.body,
                createdAt: res.createdAt,
            }))
        });
    }
    catch (error) {
        return c.body(`Internal server error: ${error}`, 500);
    }
}

export async function createPost(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body: {
        title: string,
        body: string
    } = await c.req.json();

    try {
        if ((body.title && body.body) == null) {
            return c.body('invalid user input', 400);
        }

        const res = await prisma.posts.create({
            data: {
                title: body.title,
                body: body.body,
                userId: c.get('userId'),
            }
        });

        return c.json({
            msg: 'post created successfully',
            post: {
                id: res.id,
                title: res.title,
                body: res.body,
                createdAt: res.createdAt,
            }
        });
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500)
    }
}

export async function getPost(c: Context){
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const id: number = Number(c.req.param('id'));

    try{
        const res = await prisma.posts.findUnique({
            where: {
                id: id,
                userId: c.get('userId'),
            }
        });

        if(res == null){
            return c.body('invalid post request', 404);
        }

        return c.json({
            post: {
                id: id,
                title: res?.title,
                body: res?.body,
                createdAt: res?.createdAt
            }
        });
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500);
    }
}


export async function updatePost(c: Context){
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const id: number = Number(c.req.param('id'));
    const body: {
        title: string,
        body: string,
    } = await c.req.json();

    try{
        const post = await prisma.posts.findUnique({
            where: {
                id: id,
                userId: c.get('userId'),
            }
        });

        if(post == null){
            return c.body('invalid post request', 404);
        }

        const updatedPost = await prisma.posts.update({
            where: {
                id: id
            },
            data: {
                title: body.title,
                body: body.body,
            }
        });
        
        return c.json({
            msg: "post updated successfully",
            post: {
                id: id,
                title: updatedPost.title,
                body: updatedPost.body,
                createdAt: updatedPost.createdAt
            }
        });
    }
    catch(error){
        return c.body(`internal server error: ${error}`, 500);
    }
}


export async function deletePost(c: Context){
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const id: number = Number(c.req.param('id'));

    try{
        const post = await prisma.posts.findUnique({
            where: {
                id: id,
                userId: c.get('userId'),
            }
        });

        if(post == null){
            return c.body('invalid post request', 404);
        }

        await prisma.posts.delete({
            where: {
                id: post.id,
            }
        });

        return c.json({msg:'Post deleted successfully'});
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500)
    }
}