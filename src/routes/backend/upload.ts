export async function POST({ request }: { request: Request }) {
  try {
    // Read uploaded form data
    const formData = await request.formData();

    // Get uploaded video file
    const file = formData.get("video");

    // Check if file exists
    if (!file) {
      return new Response(
        JSON.stringify({
          error: "No file uploaded",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Log uploaded file
    console.log("Received file:", file);

    // Send success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Video received successfully",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    // Send error response
    return new Response(
      JSON.stringify({
        error: "Upload failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
