import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  // Verifica se é uma requisição OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 horas
      },
    });
  }

  // Obtém a resposta padrão para outros métodos
  const response = NextResponse.next();

  // Adiciona headers CORS à resposta
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization",
  );

  return response;
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
