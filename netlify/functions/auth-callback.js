exports.handler = async function(event, context) {
    const { code, state } = event.queryStringParameters;
    
    // Redirect to your demo page with parameters
    return {
      statusCode: 302,
      headers: {
        Location: `/demo?code=${code}&state=${state}&auth=microsoft`,
      },
      body: ""
    };
  };