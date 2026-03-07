import { prisma } from "./config/prisma";

async function main() {

    const colleges = await prisma.colleges.findMany({
        take: 5
    });

    console.log(colleges);

}

main()
.then(() => {
    console.log("Query executed successfully");
})
.catch((e) => {
    console.error(e);
})
.finally(async () => {
    await prisma.$disconnect();
});