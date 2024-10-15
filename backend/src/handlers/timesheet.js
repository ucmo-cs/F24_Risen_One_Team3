const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  // Directly use event to access the JSON properties
  const projectName = event.ProjectName;

  const params = {
    TableName: process.env.PROJECT_TABLE,
    FilterExpression: 'ProjectName = :projectName', // Filter by project name 
    ExpressionAttributeValues: {
      ':projectName': projectName // maps from event to filter 
    }
  };

  try {
    const data = await dynamoDb.scan(params).promise(); // scans dynamoDB for params 

    if (data.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Project not found or timesheet missing' })
      };
    }

    return {
      statusCode: 200,
      body: data.Items[0].TimesheetData  // return timesheet data 
    };
  } catch (error) {// error catch
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
