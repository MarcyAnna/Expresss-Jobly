const { BadRequestError } = require("../expressError");

// Helper Function used in user model for updating user data
// Takes two arguments, username to be updated and the data to update the fields with
// If no user found throws error, otherwise maps the data into the correct format for the patch request
// Also used in company and job model for updating

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
