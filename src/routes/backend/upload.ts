
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/backend/upload").methods({
  POST: async ({ request }) => {
    try {
      const formData = await request.formData();

      const file = formData.get("video");

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

      console.log("Received file:", file);

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
  },
});
