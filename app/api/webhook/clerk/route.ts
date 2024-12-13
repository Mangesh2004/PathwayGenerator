import prisma from "@/app/libs/prismadb";

export const POST = async (request: Request) => {
    const {data}=await request.json();
    const email = data.email_addresses[0].email_address;
    const name = data.first_name;
    const id=data.id;

    await prisma.user.upsert({
        where: { id },
        update: { email, name},
        create: { id, email, name }
    });

    return new Response("ok");
    
}