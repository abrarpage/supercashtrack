import { handleError } from "@/services/server";
import { LIST } from "@/services/server/crud";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {


        return await LIST(request, {
            table: "transaction",
            select: {
                id: true
            },
            QParams: {

                take: 1,
            },
        });


    } catch (error) {
        return handleError(error);
    }
}