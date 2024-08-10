import { Context, Next } from "hono";
import { Jwt } from "hono/utils/jwt";

export async function authMiddleware(c: Context, next: Next){
    try{
        const authHeader = c.req.header('Authorization');
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return c.body('invalid user', 403);
        }

        const token = authHeader.split(' ')[1];
        if(token !== null || token !== undefined){
            const decodedValue = await Jwt.verify(token, c.env.JWT_TOKEN);

            const userId = decodedValue.id;
            if(decodedValue){
                c.set('userId', userId);
                await next();
            }
            else{
                return c.body('you are unauthorized user', 401);
            }
        }
        else{
            return c.body('you are unauthorized user', 401);
        }
    }
    catch(error){
        return c.body(`internal server error: ${error}`, 500);
    }
}