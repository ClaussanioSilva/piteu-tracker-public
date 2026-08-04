import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>

        <div className="mt-8 space-y-8 text-base leading-7">
          <section>
            <p>
              No PiteuTracker AI, acessível a partir da nossa aplicação e website, uma das nossas principais prioridades é a privacidade dos nossos visitantes. Este documento de Política de Privacidade contém tipos de informações que são recolhidas e registadas pelo PiteuTracker AI e como as utilizamos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">1. Informações que Recolhemos</h2>
            <p>Recolhemos vários tipos de informações para fornecer e melhorar o nosso Serviço:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Informações Pessoais:</strong> Ao registar-se, podemos solicitar informações como o seu nome, endereço de email, data de nascimento, género, altura e peso.
              </li>
              <li>
                <strong>Dados de Saúde e Fitness:</strong> Recolhemos dados relacionados com a sua nutrição, incluindo refeições registadas, contagem de calorias e macronutrientes.
              </li>
              <li>
                <strong>Imagens:</strong> Se utilizar a funcionalidade de reconhecimento de alimentos por imagem, processamos as fotos que envia.
              </li>
              <li>
                <strong>Dados de Uso:</strong> Informações sobre como acede e utiliza o Serviço (ex: tipo de dispositivo, páginas visitadas).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">2. Como Utilizamos as Suas Informações</h2>
            <p>Utilizamos as informações recolhidas para diversos fins:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Para fornecer e manter o nosso Serviço;</li>
              <li>Para calcular as suas necessidades calóricas e nutricionais (TDEE, BMR);</li>
              <li>Para permitir a participação em funcionalidades interativas;</li>
              <li>Para fornecer apoio ao cliente;</li>
              <li>Para detetar, prevenir e resolver problemas técnicos;</li>
              <li>Para monitorizar a utilização do Serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">3. Partilha de Dados e Terceiros</h2>
            <p>
              Podemos empregar empresas e indivíduos terceiros para facilitar o nosso Serviço ("Prestadores de Serviços"), fornecer o Serviço em nosso nome ou ajudar-nos a analisar como o nosso Serviço é utilizado.
            </p>
            <p className="mt-2">
              Estes terceiros têm acesso aos seus Dados Pessoais apenas para realizar estas tarefas em nosso nome e são obrigados a não os divulgar ou utilizar para qualquer outro fim.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Autenticação e Base de Dados:</strong> Utilizamos serviços como o Supabase para autenticação segura e armazenamento de dados.</li>
              <li><strong>Informação Nutricional:</strong> Utilizamos APIs de terceiros (como Nutritionix) para obter dados nutricionais de alimentos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">4. Segurança dos Dados</h2>
            <p>
              A segurança dos seus dados é importante para nós, mas lembre-se que nenhum método de transmissão pela Internet ou método de armazenamento eletrónico é 100% seguro. Embora nos esforcemos para utilizar meios comercialmente aceitáveis para proteger os seus Dados Pessoais, não podemos garantir a sua segurança absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">5. Os Seus Direitos de Proteção de Dados</h2>
            <p>
              Dependendo da sua localização, pode ter certos direitos de proteção de dados. O PiteuTracker AI visa tomar medidas razoáveis para permitir que corrija, altere, apague ou limite o uso dos seus Dados Pessoais.
            </p>
            <p className="mt-2">
              Se desejar ser informado sobre quais os Dados Pessoais que mantemos sobre si e se desejar que sejam removidos dos nossos sistemas, por favor contacte-nos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">6. Alterações a Esta Política de Privacidade</h2>
            <p>
              Podemos atualizar a nossa Política de Privacidade periodicamente. Iremos notificá-lo de quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a "data efetiva" no topo desta Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">7. Contacte-nos</h2>
            <p>
              Se tiver alguma dúvida sobre esta Política de Privacidade, por favor contacte-nos:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Por email: [Email de Contacto]</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
