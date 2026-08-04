import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Camera,
  Zap,
  CheckCircle,
  Target,
  Utensils,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
  Menu,
  X,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mobilePreview from "../assets/mobiledashpreview.jpeg"


const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPhoto, setIsPhoto] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPhoto((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const howItWorks = [
    {
      icon: Camera,
      title: "Tira uma Foto",
      description: "Aponta a câmara para a tua refeição. Sem precisar pesar ou procurar ingredientes."
    },
    {
      icon: Zap,
      title: "Análise IA Instantânea",
      description: "A nossa Inteligência Artificial identifica os alimentos e calcula as porções."
    },
    {
      icon: CheckCircle,
      title: "Macros Precisos",
      description: "Obtém calorias, proteína, hidratos e gorduras prontos no teu diário."
    }
  ];

  const features = [
    {
      icon: Camera,
      title: "Scanner IA de Alimentos",
      description: "Regista via foto, voz, digitação ou através da nossa base de dados. A IA reconhece e calcula tudo."
    },
    {
      icon: Utensils,
      title: "Detalhes Nutricionais",
      description: "Edita porções, verifica micronutrientes e ajusta as tuas refeições com facilidade."
    },
    {
      icon: TrendingUp,
      title: "Resumo Diário",
      description: "Acompanha as tuas metas de calorias, proteína e hidratação em tempo real."
    },
    {
      icon: Calendar,
      title: "Diário Alimentar",
      description: "Histórico completo de todas as tuas refeições."
    },
    {
      icon: BarChart3,
      title: "Gráficos de Progresso",
      description: "Visualiza a evolução do teu peso, calorias e macros ao longo do tempo."
    },
    {
      icon: Users,
      title: "Coach Nutricional IA",
      description: "Recebe orientações personalizadas baseadas nos teus objetivos e progresso."
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      handle: "@maria_fitness",
      content: "Perdi peso sem passar fome. O scanner de comida fez-me entender o que estava a comer mal.",
      rating: 5
    },
    {
      name: "João Santos",
      handle: "@joao_atleta",
      content: "A facilidade de contar calorias com IA apenas com uma foto poupa-me imenso tempo todos os dias. Incrível!",
      rating: 5
    },
    {
      name: "Ana Costa",
      handle: "@anacosta_nutri",
      content: "Como nutricionista, recomendo aos meus pacientes. A precisão dos macros é surpreendente para uma app.",
      rating: 5
    },
    {
      name: "Pedro Ferreira",
      handle: "@pedro_crossfit",
      content: "Uso para garantir a minha proteína diária. A funcionalidade de áudio é genial quando estou com pressa.",
      rating: 5
    },
    {
      name: "Sofia Martins",
      handle: "@sofia.lifestyle",
      content: "O design é lindo e super intuitivo. Finalmente uma app de nutrição que não parece uma folha de cálculo aborrecida.",
      rating: 4
    },
    {
      name: "Miguel Ângelo",
      handle: "@miguel_runs",
      content: "Corro maratonas e preciso de controlar os hidratos ao pormenor. O PiteuTracker mudou a minha preparação.",
      rating: 5
    },
    {
      name: "Beatriz Lima",
      handle: "@bea_vegan",
      content: "Adoro que reconheça pratos vegetarianos complexos sem eu ter de inserir ingrediente por ingrediente.",
      rating: 5
    },
    {
      name: "Tiago Gomes",
      handle: "@tiago_gymrat",
      content: "Já testei várias apps, mas esta é a única que realmente acerta nas porções só pela foto. Vale cada cêntimo.",
      rating: 5
    },
    {
      name: "Lara Nunes",
      handle: "@lara_busy_mom",
      content: "Com dois filhos, não tenho tempo para pesar comida. Tiro foto e está feito. Perdi 5kg em 2 meses!",
      rating: 5
    },
    {
      name: "André Viana",
      handle: "@andre_tech",
      content: "A tecnologia de reconhecimento é impressionante. Até distingue tipos de arroz! Muito bom trabalho.",
      rating: 4
    },
    {
      name: "Cláudia Reis",
      handle: "@claudia_yoga",
      content: "Ajudou-me a ter uma relação mais saudável com a comida. O coach IA dá conselhos muito sensatos e motivadores.",
      rating: 5
    },
    {
      name: "Bruno Tavares",
      handle: "@bruno_btt",
      content: "Simples, rápido e eficaz. O scan de código de barras é super rápido no supermercado.",
      rating: 5
    },
    {
      name: "Mariana Dias",
      handle: "@mariana_foodie",
      content: "Fotografar o meu prato tornou-se um hábito. Os gráficos de progresso mantêm-me focada nos objetivos.",
      rating: 5
    },
    {
      name: "Ricardo Lopes",
      handle: "@ricardo_lopes_pt",
      content: "Recomendo a todos os meus clientes de PT. Facilita muito o meu trabalho de acompanhamento.",
      rating: 5
    },
    {
      name: "Inês Cabral",
      handle: "@ines_student",
      content: "A versão gratuita já é ótima, mas a Premium vale muito a pena pelas análises detalhadas.",
      rating: 4
    },
    {
      name: "Marta Viegas",
      handle: "@marta_v",
      content: "A única app que percebe o meu sotaque quando descrevo a refeição! Top.",
      rating: 5
    },
    {
      name: "Rui Pires",
      handle: "@ruipires_dev",
      content: "Integração perfeita com o HealthKit. Os dados são super precisos.",
      rating: 5
    },
    {
      name: "Joana Melo",
      handle: "@joanamelo_fit",
      content: "Adoro a funcionalidade de criar receitas. Facilita imenso o meal prep de domingo.",
      rating: 5
    },
    {
      name: "Carlos Eduardo",
      handle: "@carlosedu_bjj",
      content: "Para quem treina jiu-jitsu, controlar a hidratação é chave. O PiteuTracker ajuda imenso.",
      rating: 4
    },
    {
      name: "Teresa Ramos",
      handle: "@teresa_ramos_bio",
      content: "Gosto muito da base de dados de produtos nacionais. Encontro tudo o que compro no Pingo Doce.",
      rating: 5
    },
    {
      name: "Fábio Silva",
      handle: "@fabio_gamer",
      content: "Até que enfim uma app que não me obriga a passar horas a registar coisas. Foto e siga.",
      rating: 5
    },
    {
      name: "Patrícia Antunes",
      handle: "@paty_antunes",
      content: "O suporte é super rápido a responder. Tive uma dúvida e resolveram em minutos.",
      rating: 5
    },
    {
      name: "Diogo Moreira",
      handle: "@diogo_moreira_tri",
      content: "Uso na preparação para o Ironman. A precisão dos hidratos é fundamental para mim.",
      rating: 5
    },
    {
      name: "Helena Sousa",
      handle: "@helena_sousa_psi",
      content: "Ajudou-me a perceber que comia pouca proteína. Sinto-me com muito mais energia agora.",
      rating: 5
    },
    {
      name: "Gonçalo Neves",
      handle: "@goncalo_neves_chef",
      content: "Como chef, sou exigente. A app reconhece empratamentos complexos melhor do que esperava.",
      rating: 4
    }
  ];

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gray-900">PiteuTracker</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Funcionalidades
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Testemunhos
              </a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-900 hover:text-gray-900 hover:bg-transparent">Entrar</Button>
              </Link>
              <Link to="/onboarding">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Começar Grátis
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-gray-200"
            >
              <div className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Funcionalidades
                </a>
                <a 
                  href="#testimonials" 
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testemunhos
                </a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-900 hover:text-gray-900 hover:bg-transparent">Entrar</Button>
                  </Link>
                  <Link to="/onboarding" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Começar Grátis</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            > 
              <h1 className="text-5xl sm:text-5xl lg:text-6xl text-gray-900 mb-2 leading-tight tracking-tight">
                <span className="font-bold block">Conheça a PiteuTracker AI</span>
                <span className="block mt-2 font-normal">
                  Controle as suas calorias com{" "}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isPhoto ? "foto" : "audio"}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-primary inline-block font-medium"
                    >
                      {isPhoto ? "uma foto" : "um audio"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
              
              <p className="text-sm text-gray-600 mb-8 max-w-xl leading-relaxed">
                A PiteuTracker AI analisa o teu prato. Faça uma uma foto, scan do código de barras ou descreva a sua refeiçao com um audio para que tenhas acesso as calorias e macros da tua refeição automaticamente. Simples, rápido e preciso.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-start">
                <Link to="/onboarding">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6 rounded-xl shadow-lg shadow-md"
                  >
                    Começar Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right content - Phone Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[280px] sm:w-[320px] h-[545px] sm:h-[625px] bg-black rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                    <img 
                      src={mobilePreview} 
                      alt="App Dashboard Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como o Scanner IA Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nutrição inteligente em 3 passos simples
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-foreground overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-background mb-4">
              O que dizem os nossos utilizadores
            </h2>
            <p className="text-lg text-background/70 max-w-2xl mx-auto">
              Histórias reais de quem transformou a sua alimentação com a PiteuTracker
            </p>
          </motion.div>
        </div>

        {/* Infinite Marquee Carousel */}
        <div className="relative w-full overflow-hidden">
          {/* Gradient Masks for smooth fade effect at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-foreground to-transparent z-10 hidden md:block" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-foreground to-transparent z-10 hidden md:block" />

          <div className="flex">
            <motion.div
              className="flex gap-6 py-4"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 60,
                  ease: "linear",
                },
              }}
              style={{ width: "fit-content" }}
            >
              {/* Double the array to create seamless loop */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="w-[300px] md:w-[400px] flex-shrink-0 bg-card/10 backdrop-blur-sm rounded-2xl p-6 border border-background/10 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-background">{testimonial.name}</div>
                      <div className="text-xs text-background/60">{testimonial.handle}</div>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-background/20"}`} 
                      />
                    ))}
                  </div>
                  <p className="text-background/90 leading-relaxed text-sm md:text-base">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tecnologia de Ponta para a Tua Dieta
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo o que precisas para automatizar a tua nutrição
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Phone mockup */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center lg:sticky lg:top-32"
            >
              <div className="w-[260px] sm:w-[300px] h-[520px] sm:h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-background flex items-center justify-center">
                    <div className="w-24 h-5 bg-foreground rounded-full" />
                  </div>
                  
                  {/* Food diary mockup */}
                  <div className="pt-12 px-4 h-full overflow-hidden">
                    <div className="text-sm font-semibold text-foreground mb-4">Diário Alimentar</div>
                    
                    {[
                      { name: "Pequeno-almoço", cal: 423, p: 29, c: 45, g: 12 },
                      { name: "Almoço", cal: 650, p: 35, c: 60, g: 22 },
                      { name: "Lanche", cal: 180, p: 8, c: 25, g: 6 },
                      { name: "Jantar", cal: 520, p: 40, c: 35, g: 18 },
                    ].map((meal, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 mb-2 bg-muted/30 rounded-xl">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Utensils className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{meal.name}</div>
                          <div className="text-xs text-muted-foreground">{meal.p}g · {meal.c}g · {meal.g}g</div>
                        </div>
                        <span className="text-sm font-bold text-primary">{meal.cal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features list */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
              Pronto para transformar a tua nutrição?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
              Junta-te a milhares de pessoas que já alcançaram os seus objetivos nutricionais com a ajuda da nossa IA inteligente.
            </p>
            <Link to="/onboarding">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-base px-8 py-6 rounded-xl shadow-lg"
              >
                Começar Agora — É Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-gray-900">PiteuTracker</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                A tua nutrição simplificada com Inteligência Artificial. 
                Atinge os teus objetivos sem stress e sem complicações.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all duration-300">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Produto</h3>
              <ul className="space-y-4">
                <li><a href="#features" className="text-gray-500 hover:text-primary transition-colors">Funcionalidades</a></li>
                <li><a href="#testimonials" className="text-gray-500 hover:text-primary transition-colors">Testemunhos</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Empresa</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Blog de Nutrição</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Imprensa</a></li>
                <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Contacto</a></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Fica a par das novidades</h3>
              <p className="text-gray-500 mb-6">Recebe dicas de nutrição e atualizações da app diretamente no teu email.</p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="O teu email" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-6">
                  Subscrever Newsletter
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} PiteuTracker AI. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacidade</Link>
              <Link to="/terms" className="hover:text-gray-900 transition-colors">Termos de Serviço</Link>
              <Link to="/privacy" className="hover:text-gray-900 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;