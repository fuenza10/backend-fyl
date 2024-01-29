export default function (companyId: string, userId: string) {
  let whereClause = {};

  if (companyId) {
    whereClause = {
      CompanyForms: {
        some: {
          companyId,
        },
      },
    };
  }

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
