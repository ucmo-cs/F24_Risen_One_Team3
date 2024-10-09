'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const params = {
    TableName: process.env.PROJECT_TABLE, //sets dynamoDB table 
  };

  try {
    const data = await dynamoDb.scan(params).promise(); // scans dynamoDB table

    if (!data.Items || data.Items.length === 0) { // Checks for item in DB table 
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No projects found' })
      };
    }

    const projectNames = data.Items.map(item => item.ProjectName); 
    return {
      statusCode: 200,
      body: projectNames
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
