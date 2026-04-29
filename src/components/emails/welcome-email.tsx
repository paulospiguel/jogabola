import type * as React from "react";

interface WelcomeEmailProps {
  username: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ username }) => (
  <div style={{ fontFamily: "sans-serif", color: "#333" }}>
    <h1>Bem-vindo à Jogabola Arena, {username}!</h1>
    <p>Estamos muito felizes por te teres juntado a nós.</p>
    <p>
      Acede à tua conta para começares a explorar os torneios e desafios que
      temos para ti.
    </p>
    <a
      href="https://jogabola.fun"
      style={{
        display: "inline-block",
        padding: "10px 20px",
        backgroundColor: "#050312",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "5px",
      }}
    >
      Ir para a Arena
    </a>
  </div>
);
