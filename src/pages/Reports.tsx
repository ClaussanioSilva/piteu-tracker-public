import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { 
  ChevronLeft, 
  ChevronRight, 
  Target,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNutrition } from "@/providers/nutrition-context";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DailyData {
  date: string;
  displayDate: string;
  timestamp: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroData {
  name: string;
  value: number;
}

interface WeightLog {
  id: string;
  weight_kg: number;
  body_fat_percentage?: number;
  log_date: string;
  created_at: string;
  is_initial?: boolean;
}

const Reports = () => {
  const { foodLogs: logs, dailyGoals } = useNutrition();
  const [activeTab, setActiveTab] = useState("calorias");
  const [reportData, setReportData] = useState<DailyData[]>([]);
  const [macrosData, setMacrosData] = useState<MacroData[]>([]);
  const [dailyAverage, setDailyAverage] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<{ weight_kg: number; goal: string; target_weight_kg?: number } | null>(null);
  const [variationPeriod, setVariationPeriod] = useState<7 | 15 | 30>(7);
  const [averagePeriod, setAveragePeriod] = useState<7 | 15 | 30>(7);

  useEffect(() => {
    const fetchWeightLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch weight logs from the history view (which combines profile and logs)
      const { data: logsData } = await supabase
        .from('weight_history_view')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: true })
      
      if (logsData) setWeightLogs(logsData)

      // Fetch profile for goal
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) setProfile(profileData)
    }
    fetchWeightLogs()
  }, [])

  const getGoalWeight = () => {
    if (profile?.target_weight_kg) return profile.target_weight_kg.toFixed(1)
    
    if (!profile?.weight_kg) return "--"
    // Simple logic matching Profile.tsx
    if (profile.goal === 'lose_weight') return (profile.weight_kg - 5).toFixed(1)
    if (profile.goal === 'gain_weight' || profile.goal === 'gain_muscle') return (profile.weight_kg + 5).toFixed(1)
    return profile.weight_kg.toFixed(1)
  }

  const getWeightVariation = () => {
    if (weightLogs.length < 2) return null
    
    const latestLog = weightLogs[weightLogs.length - 1]
    const targetDate = new Date(latestLog.log_date)
    targetDate.setDate(targetDate.getDate() - variationPeriod)
    
    // Find log closest to target date (but not after today)
    // We want the log that is closest to 'variationPeriod' days ago
    // Simple approximation: find log with date <= targetDate
    // Since logs are ordered ascending, we can reverse or search from end
    
    // Better approach: find the log that is closest to the target date
    let closestLog = weightLogs[0]
    let minDiff = Infinity
    
    weightLogs.forEach(log => {
      const logDate = new Date(log.log_date)
      const diff = Math.abs(logDate.getTime() - targetDate.getTime())
      // We only want to compare with past logs, so strictly the log must be before or equal to the latest log
      // But we are looking for a log ~X days ago.
      if (diff < minDiff && log.id !== latestLog.id) {
        minDiff = diff
        closestLog = log
      }
    })

    if (closestLog.id === latestLog.id) return null // No previous data to compare

    const diff = latestLog.weight_kg - closestLog.weight_kg
    return {
      value: diff,
      formatted: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`,
      isGain: diff > 0,
      isLoss: diff < 0,
      period: variationPeriod
    }
  }

  const variation = getWeightVariation()
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : 0

  const toggleVariationPeriod = (direction: 'left' | 'right') => {
    setVariationPeriod(prev => {
      if (direction === 'left') {
        if (prev === 30) return 15
        if (prev === 15) return 7
        return 30
      } else {
        if (prev === 7) return 15
        if (prev === 15) return 30
        return 7
      }
    })
  }

  // Processar dados para as médias (Top Cards)
  useEffect(() => {
    if (!logs) return;

    const now = new Date();
    now.setHours(23, 59, 59, 999); // Final do dia atual

    const startDate = new Date();
    startDate.setDate(now.getDate() - averagePeriod);
    startDate.setHours(0, 0, 0, 0); // Início do período

    // Filtrar logs pelo período selecionado (últimos X dias)
    const periodLogs = logs.filter(log => {
      // Criar data localmente para comparação correta
      const [year, month, day] = log.log_date.split('T')[0].split('-').map(Number);
      const logDate = new Date(year, month - 1, day);
      
      return logDate >= startDate && logDate <= now;
    });

    if (periodLogs.length === 0) {
        setDailyAverage({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        return;
    }

    // Agrupar por dia para calcular média diária correta
    const dailyTotals: Record<string, { calories: number, protein: number, carbs: number, fat: number }> = {};
    
    periodLogs.forEach(log => {
        const dayKey = log.log_date.split('T')[0]; // YYYY-MM-DD
        if (!dailyTotals[dayKey]) {
            dailyTotals[dayKey] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyTotals[dayKey].calories += log.calories || 0;
        dailyTotals[dayKey].protein += log.protein_g || 0;
        dailyTotals[dayKey].carbs += log.carbs_g || 0;
        dailyTotals[dayKey].fat += log.fat_g || 0;
    });

    const daysCount = Object.keys(dailyTotals).length || 1;
    const totals = Object.values(dailyTotals).reduce((acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fat: acc.fat + curr.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setDailyAverage({
        calories: Math.round(totals.calories / daysCount),
        protein: Math.round(totals.protein / daysCount),
        carbs: Math.round(totals.carbs / daysCount),
        fat: Math.round(totals.fat / daysCount)
    });

  }, [logs, averagePeriod]);

  // Processar dados para os gráficos (Período Selecionado)
  useEffect(() => {
    if (!logs) return;

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(now.getDate() - averagePeriod);
    startDate.setHours(0, 0, 0, 0);

    // Filtrar logs pelo período selecionado
    const filteredLogs = logs.filter(log => {
      const [year, month, day] = log.log_date.split('T')[0].split('-').map(Number);
      const logDate = new Date(year, month - 1, day);
      
      return logDate >= startDate && logDate <= now;
    });

    if (filteredLogs.length === 0) {
      setReportData([]);
      setMacrosData([]);
      // Não resetamos dailyAverage aqui pois ele agora depende de averagePeriod
      return;
    }

    // Agrupar dados por dia para o gráfico de calorias
    const dailyData: Record<string, DailyData> = {};
    
    filteredLogs.forEach(log => {
      const logDate = new Date(log.log_date);
      const dayKey = log.log_date.split('T')[0];
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: dayKey,
          displayDate: format(logDate, 'dd/MM'),
          timestamp: logDate.getTime(),
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
      }
      
      // Usar os campos corretos do FoodLog
      const calories = log.calories || 0;
      const protein = log.protein_g || 0;
      const carbs = log.carbs_g || 0;
      const fat = log.fat_g || 0;
      
      dailyData[dayKey].calories += calories;
      dailyData[dayKey].protein += protein;
      dailyData[dayKey].carbs += carbs;
      dailyData[dayKey].fat += fat;
    });

    // Converter para array e ordenar por data
    const processedData = Object.values(dailyData).sort((a, b) => a.timestamp - b.timestamp);
    setReportData(processedData);

    // Calcular totais para o gráfico de macros (média do período)
    const totalProtein = processedData.reduce((sum, day) => sum + day.protein, 0);
    const totalCarbs = processedData.reduce((sum, day) => sum + day.carbs, 0);
    const totalFat = processedData.reduce((sum, day) => sum + day.fat, 0);
    
    const daysInPeriod = processedData.length;
    const avgProtein = daysInPeriod > 0 ? Math.round(totalProtein / daysInPeriod) : 0;
    const avgCarbs = daysInPeriod > 0 ? Math.round(totalCarbs / daysInPeriod) : 0;
    const avgFat = daysInPeriod > 0 ? Math.round(totalFat / daysInPeriod) : 0;
    
    setMacrosData([
      { name: 'Proteínas', value: avgProtein },
      { name: 'Carboidratos', value: avgCarbs },
      { name: 'Gorduras', value: avgFat }
    ]);

  }, [logs, averagePeriod]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe seu progresso
            </p>
          </div>
          
          {/* Apenas Ano Atual */}
          <div className="flex items-center bg-muted/30 rounded-full px-4 py-1.5 border border-border/50">
             <span className="text-sm font-semibold text-muted-foreground">
                {new Date().getFullYear()}
             </span>
          </div>
        </div>
      </div>

      {/* Seletor de Período para Médias */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-muted-foreground">Médias Nutricionais</h2>
        <div className="flex items-center bg-muted/30 rounded-full p-1 border border-border/50">
            {[7, 15, 30].map((period) => (
                <Button
                    key={period}
                    variant={averagePeriod === period ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAveragePeriod(period as 7 | 15 | 30)}
                    className={`h-7 px-3 text-xs rounded-full transition-all ${averagePeriod === period ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {period}d
                </Button>
            ))}
        </div>
      </div>

      {/* Resumo do mês */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Calorias (Média)
            </CardTitle>
            <Target className="h-3 w-3 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{dailyAverage.calories}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {dailyGoals?.calories?.target ? `${Math.round((dailyAverage.calories / dailyGoals.calories.target) * 100)}% da meta` : '-'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Proteínas
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{dailyAverage.protein}g</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {dailyGoals?.protein?.target ? `${Math.round((dailyAverage.protein / dailyGoals.protein.target) * 100)}%` : '-'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Carbos
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{dailyAverage.carbs}g</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {dailyGoals?.carbs?.target ? `${Math.round((dailyAverage.carbs / dailyGoals.carbs.target) * 100)}%` : '-'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Gorduras
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{dailyAverage.fat}g</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {dailyGoals?.fat?.target ? `${Math.round((dailyAverage.fat / dailyGoals.fat.target) * 100)}%` : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes tipos de gráficos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full rounded-2xl bg-muted/30 p-1">
          <TabsTrigger value="calorias" className="flex-1 rounded-xl">
            Calorias
          </TabsTrigger>
          <TabsTrigger value="macros" className="flex-1 rounded-xl">
            Macros
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex-1 rounded-xl">
            Tendências
          </TabsTrigger>
          <TabsTrigger value="peso" className="flex-1 rounded-xl">
            Peso
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da tab de calorias */}
        <TabsContent value="calorias" className="space-y-4">
          <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Consumo Diário</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-[250px] sm:h-[300px]">
                {reportData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="displayDate" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey="calories" 
                        name="Calorias" 
                        fill="currentColor" 
                        className="fill-primary"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Sem dados para este período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da tab de macros */}
        <TabsContent value="macros" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Distribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {macrosData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={macrosData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {macrosData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground text-sm">Sem dados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Diário</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="h-[250px]">
                  {reportData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="protein" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="carbs" stackId="a" fill="#22c55e" />
                        <Bar dataKey="fat" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground text-sm">Sem dados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Conteúdo da tab de tendências */}
        <TabsContent value="tendencias" className="space-y-4">
          <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Tendências</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-[300px]">
                {reportData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reportData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" height={36}/>
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="calories" 
                        name="Kcal" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="protein" 
                        name="Prot" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Sem dados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da tab de peso */}
        <TabsContent value="peso" className="space-y-4">
          
          {/* Dica de Acompanhamento */}
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-3xl p-4 flex gap-4 items-start animate-in slide-in-from-top-4">
            <div className="p-2 bg-emerald-500/10 rounded-full shrink-0">
              <Scale className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-emerald-500">Dica de Acompanhamento</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pese-se sempre no mesmo horário, preferencialmente pela manhã em jejum, 
                para obter medições mais consistentes e acompanhar seu progresso com precisão.
              </p>
            </div>
          </div>

          {/* Resumo Peso */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden flex flex-col items-center justify-center py-4">
              <div className="flex flex-col items-center gap-1">
                <Scale className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="text-2xl font-bold">{currentWeight} <span className="text-sm font-normal text-muted-foreground">kg</span></span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Peso Atual</span>
              </div>
            </Card>

            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden flex flex-col items-center justify-center py-4 relative group transition-all hover:shadow-md">
              <div className="flex flex-col items-center gap-1 w-full px-2">
                {variation ? (() => {
                  const isWeightLossGoal = profile?.goal === 'lose_weight' || !profile?.goal;
                  const isGood = (variation.isLoss && isWeightLossGoal) || (variation.isGain && !isWeightLossGoal);
                  const colorClass = isGood ? 'text-emerald-500' : (variation.value === 0 ? 'text-muted-foreground' : 'text-rose-500');
                  const Icon = variation.isGain ? TrendingUp : (variation.isLoss ? TrendingDown : Minus);
                  
                  return (
                  <>
                     <div className="flex items-center justify-center w-full relative mb-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full absolute left-0 text-muted-foreground hover:bg-muted/50" 
                            onClick={() => toggleVariationPeriod('left')}
                            aria-label="Período anterior"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                        
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30 px-2 py-0.5 rounded-full">
                          {variationPeriod} dias
                        </span>
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full absolute right-0 text-muted-foreground hover:bg-muted/50" 
                            onClick={() => toggleVariationPeriod('right')}
                            aria-label="Próximo período"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                     </div>

                     <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${colorClass} animate-in fade-in zoom-in duration-500`} />
                        <span className={`text-3xl font-bold tracking-tight ${colorClass}`}>
                          {variation.formatted}
                        </span>
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">kg de diferença</span>
                  </>
                  );
                })() : (
                  <>
                    <div className="flex items-center justify-center w-full relative mb-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full absolute left-0 text-muted-foreground" onClick={() => toggleVariationPeriod('left')} aria-label="Período anterior">
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                         <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {variationPeriod} dias
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full absolute right-0 text-muted-foreground" onClick={() => toggleVariationPeriod('right')} aria-label="Próximo período">
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                    <Minus className="w-6 h-6 text-muted-foreground/50 mb-1" />
                    <span className="text-sm text-muted-foreground text-center px-2 leading-tight">
                        Sem dados suficientes
                    </span>
                  </>
                )}
              </div>
            </Card>

            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden flex flex-col items-center justify-center py-4">
              <div className="flex flex-col items-center gap-1">
                <Target className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-2xl font-bold text-blue-500">{getGoalWeight()} <span className="text-sm font-normal text-muted-foreground">kg</span></span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Meta</span>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Evolução de Peso</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-[300px]">
                {weightLogs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weightLogs}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="log_date" 
                        tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(date) => format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight_kg" 
                        name="Peso (kg)" 
                        stroke="#0ea5e9" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0ea5e9" }}
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Sem dados de peso registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                 {[...weightLogs].reverse().map((log, index, arr) => {
                    const prevLog = arr[index + 1]
                    const diff = prevLog ? log.weight_kg - prevLog.weight_kg : 0
                    
                    // Lógica de cores baseada na meta
                    const isWeightLossGoal = profile?.goal === 'lose_weight' || !profile?.goal;
                    // Se perdeu peso e quer perder = Bom (Verde)
                    // Se ganhou peso e quer ganhar = Bom (Verde)
                    // Caso contrário = Ruim (Vermelho) ou Neutro
                    
                    // Definindo se é "Bom" para o usuário
                    const isGood = (diff < 0 && isWeightLossGoal) || (diff > 0 && !isWeightLossGoal);
                    const isNeutral = diff === 0;

                    let badgeClass = "bg-secondary text-muted-foreground";
                    let Icon = Minus;

                    if (!isNeutral) {
                        if (isGood) {
                            badgeClass = "bg-emerald-500/10 text-emerald-500";
                        } else {
                            badgeClass = "bg-rose-500/10 text-rose-500";
                        }
                        Icon = diff > 0 ? TrendingUp : TrendingDown;
                    }
                    
                    return (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-primary/20 rounded-2xl transition-all hover:bg-secondary/40">
                             <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                 <Scale className="h-5 w-5 text-emerald-500" />
                               </div>
                               <div>
                                 <p className="text-xl font-bold tracking-tight text-foreground">{log.weight_kg} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                                 <p className="text-sm text-muted-foreground capitalize">
                                   {format(new Date(log.log_date), "dd 'de' MMM.", { locale: ptBR })}
                                 </p>
                               </div>
                             </div>
                             
                             {prevLog && (
                               <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badgeClass}`}>
                                 <Icon className="h-4 w-4" />
                                 <span className="font-semibold text-sm">
                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                                 </span>
                               </div>
                             )}
                        </div>
                    )
                 })}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;