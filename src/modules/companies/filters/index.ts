export default function (userId: string) {
    let whereClause = {};



    if (userId) {
        whereClause = {
            userForms: {
                some: {
                    userId,
                },
            },
        };
    }
    return whereClause;
}
