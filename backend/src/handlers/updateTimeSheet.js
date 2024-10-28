const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const projectName = event.ProjectName;

  const scanParams = {
    TableName: process.env.PROJECT_TABLE,
    FilterExpression: 'ProjectName = :projectName',  // filters database table by ProjectName 
    ExpressionAttributeValues: {
      ':projectName': projectName
    }
  };

  try {
    const scanResult = await dynamoDb.scan(scanParams).promise();  // scan table 

    if (scanResult.Items.length === 0) { // checks if proeject exsists 
      return {
        statusCode: 404,
        body: { message: 'Project not found' }
      };
    }

    const primaryKeys = scanResult.Items[0]; // primary key value
    
    const updateParams = {
      TableName: process.env.PROJECT_TABLE,
      Key: {
        "ProjectID": primaryKeys.ProjectID // Sets key with priamry key
      },
      UpdateExpression: "SET TimesheetData = :TimesheetData",// updates attribute
      ExpressionAttributeValues: {
        ":TimesheetData": event.TimesheetData  //sets value 
      },
    };

    await dynamoDb.update(updateParams).promise(); // executes update operation 

    return {
      statusCode: 200,
      body: { message: 'TimeSheet data updated' }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    };
  }
};
