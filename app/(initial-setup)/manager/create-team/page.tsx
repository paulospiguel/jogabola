import CreateTeamForm from "@/components/create-team/create-form";

export default async function ManagerCreateTeam() {
  return (
    <>
      <h1 className="text-4xl mb-2 font-bold text-center mt-4">Crie sua equipa</h1>
      <div className="space-y-2 text-center">
        <p className="italic">Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.</p>
        <p className="">Vamos dar o nome a próxima equipa campeã:</p>
      </div>

      <CreateTeamForm />
    </>
  );
}