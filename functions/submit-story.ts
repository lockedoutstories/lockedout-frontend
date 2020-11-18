import { parse } from "querystring";
import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = (event, context, callback) => {
  let body: any = {};
  console.log(event);
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    body = parse(event.body);
  }

  // Bail if story is missing
  if (!body.story) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: "missing story",
      }),
    });
  }

  // TODO: submit story

  // Do redirect for non JS enabled browsers
  if (event.headers["content-type"] === "application/x-www-form-urlencoded") {
    return callback(null, {
      statusCode: 302,
      headers: {
        Location: "/thanks.html",
        "Cache-Control": "no-cache",
      },
      body: "",
    });
  }

  // Return data to JS Fetch request
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      storySubmitted: true,
    }),
  });
};
