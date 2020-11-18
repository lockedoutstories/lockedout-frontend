import { parse } from "querystring";
import { APIGatewayProxyHandler } from "aws-lambda";
import wordpress from "wordpress";

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

  submitStory(body)
    .then(() => {
      // Do redirect for non JS enabled browsers
      if (
        event.headers["content-type"] === "application/x-www-form-urlencoded"
      ) {
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
    })
    .catch((err) => {
      console.error(err);
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: err,
        }),
      });
    });
};

type ExpectedBody = { story: string };
async function submitStory(body: ExpectedBody) {
  // Submit a story
  const client = wordpress.createClient({
    url: process.env.WORDPRESS_URL,
    username: process.env.WORDPRESS_USER,
    password: process.env.WORDPRESS_PASSWORD,
  });

  const postId = await new Promise((resolve, reject) => {
    client.newPost(
      {
        title: "New draft story submission",
        status: "draft",
        content: body.story,
      },
      (err, id: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      }
    );
  });

  console.log(`Created draft post ${postId}`);

  return postId;
}
