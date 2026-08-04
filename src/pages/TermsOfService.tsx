import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                PiteuTracker AI
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-start space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6 lg:py-10">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Termos de Serviço
          </h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>

        <div className="mt-8 space-y-8 text-base leading-7">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao aceder e utilizar o PiteuTracker AI ("Serviço", "Aplicação"), concorda em cumprir e ficar vinculado aos seguintes Termos de Serviço. Se não concordar com qualquer parte destes termos, não poderá aceder ao Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">2. Descrição do Serviço</h2>
            <p>
              O PiteuTracker AI é uma aplicação de monitorização nutricional que permite aos utilizadores registar refeições, calcular macronutrientes e acompanhar metas de saúde. O Serviço é fornecido "tal como está" e destina-se apenas a fins informativos e educativos. Não substitui o aconselhamento médico profissional, diagnóstico ou tratamento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">3. Registo e Conta de Utilizador</h2>
            <p>
              Para utilizar certas funcionalidades do Serviço, poderá ser necessário criar uma conta. É responsável por manter a confidencialidade das credenciais da sua conta e por todas as atividades que ocorram sob a sua conta. Concorda em notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">4. Conteúdo do Utilizador</h2>
            <p>
              O Serviço permite-lhe publicar, ligar, armazenar, partilhar e disponibilizar certas informações, textos, gráficos, vídeos ou outro material ("Conteúdo"). É responsável pelo Conteúdo que publica no Serviço, incluindo a sua legalidade, fiabilidade e adequação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">5. Propriedade Intelectual</h2>
            <p>
              O Serviço e o seu conteúdo original (excluindo o Conteúdo fornecido pelos utilizadores), características e funcionalidades são e continuarão a ser propriedade exclusiva do PiteuTracker AI e dos seus licenciadores. O Serviço está protegido por direitos de autor, marcas registadas e outras leis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">6. Links para Outros Websites</h2>
            <p>
              O nosso Serviço pode conter links para sites ou serviços de terceiros que não são detidos ou controlados pelo PiteuTracker AI. Não temos controlo sobre, e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer sites ou serviços de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">7. Rescisão</h2>
            <p>
              Podemos rescindir ou suspender a sua conta imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se violar os Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">8. Limitação de Responsabilidade</h2>
            <p>
              Em caso algum o PiteuTracker AI, nem os seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes do seu acesso ou uso ou incapacidade de aceder ou usar o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">9. Alterações aos Termos</h2>
            <p>
              Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes de quaisquer novos termos entrarem em vigor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">10. Contacto</h2>
            <p>
              Se tiver alguma dúvida sobre estes Termos, por favor contacte-nos:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Por email: <Link to="mailto:contact@piteuai.com">contact@piteuai.com</Link></li>
              <li>Através do nosso website: <Link to="/contact">Contacto</Link></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
