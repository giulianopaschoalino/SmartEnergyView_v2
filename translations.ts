
export const translations = {
  pt: {
    nav: {
      dashboard: 'Visão Geral',
      economy: 'Economia',
      telemetry: 'Telemetria',
      operation_summary: 'Resumo Op.',
      news: 'Notícias',
      pld: 'Preço PLD',
      sectorial_info: 'Info Setorial',
      notifications: 'Notificações',
      about_us: 'Sobre Nós',
      faq: 'FAQ',
      settings: 'Ajustes',
      premium: 'Premium',
      logout: 'Sair'
    },
    common: {
      all: 'Todas',
      units: 'Unidades',
      allUnits: 'Todas as Unidades',
      date: 'Data',
      loading: 'Carregando...',
      noData: 'Sem dados.',
      download: 'Baixar',
      back: 'Voltar',
      verified: 'Verificado pelo Provedor',
      locked: 'Identidade Bloqueada',
      refresh: 'Atualizar',
      reload: 'Recarregar',
      updating: 'Atualizando...',
      fetching: 'Buscando...',
      tryAgain: 'Tentar Novamente',
      more: 'Mais'
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Gerencie conta e preferências',
      profile: 'Perfil da Conta',
      premium: 'Assinante Premium',
      edit: 'Gerenciar',
      accountID: 'Identificador da Conta',
      identityNotice: 'Gerenciado pelo provedor central',
      appearance: 'Aparência',
      theme: 'Preferência de Tema',
      themeDesc: 'Escolha seu estilo visual',
      language: 'Idioma',
      languageDesc: 'Idioma preferido do app',
      notifications: 'Notificações',
      alerts: 'Alertas de Uso',
      alertsDesc: 'Avisar quando exceder limite',
      summary: 'Resumo Semanal',
      summaryDesc: 'Relatórios de custo toda segunda',
      logout: 'Sair da Conta',
      version: 'Smart Energia Insight • v2.0.4 • Build 108'
    },
    profile: {
      title: 'Meu Perfil',
      subtitle: 'Informações verificadas',
      personalDetails: 'Detalhes Pessoais',
      name: 'Nome Legal',
      email: 'Endereço de E-mail',
      membership: 'Status do Plano',
      membershipDesc: 'Ativo desde 2023',
      save: 'Fechar',
      cancel: 'Voltar',
      verifiedUser: 'Usuário Verificado'
    },
    dashboard: {
      title: 'Visão Geral',
      subtitle: 'Desempenho em um relance',
      source: 'Fonte',
      sources: { All: 'Todas', Solar: 'Solar', Grid: 'Rede', Battery: 'Bateria' },
      stats: { usage: 'Uso', cost: 'Custo', avg: 'Média', economyTitle: 'Economia' },
      charts: { 
        usageTrend: 'Tendência de Uso', 
        costVsFree: 'Custo x Mercado', 
        captive: 'Cativo', 
        free: 'Livre', 
        economy: 'Economia',
        annualGross: 'Economia Anual Bruta',
        monthlyGross: 'Economia Mensal Bruta',
        monthlySavings: 'Histórico de Economia',
        captiveVsFree: 'Cativo x Livre',
        estimates: 'Comparação de Estimativas',
        mwhPrice: 'Preço por MWh',
        indicator: 'Histórico do Indicador'
      },
      accumulated: 'Acumulado Atual',
      refreshAll: 'Atualizar Tudo',
      refreshingAll: 'Atualizando Tudo...',
      pldUnit: 'R$/MWh',
      ai: { 
        title: 'Insights de IA', 
        subtitle: 'Análise Gemini', 
        refresh: 'Atualizar', 
        loading: 'Pensando...', 
        default: 'Aguardando dados...',
        prompt: 'Clique no ícone de Atualizar acima para gerar Insights de IA para seus dados de energia atuais.'
      }
    },
    economy: {
      title: 'Desempenho Econômico',
      subtitle: 'Analise suas economias e tendências de mercado',
      emptyTitle: "Onde estão os dados?",
      emptySubtitle: 'Nenhum registro encontrado para o período selecionado.',
      tabs: {
        annual: 'Bruto Anual',
        monthly: 'Bruto Mensual',
        captiveVsFree: 'Cativo x Livre',
        costMWh: 'Custo por MWh'
      }
    },
    telemetry: {
      title: 'Telemetria',
      subtitle: 'Consumo em tempo real e dados técnicos',
      historicalNotice: 'Visão Histórica: Exibindo pontos do período anterior (nenhum dado atual encontrado).',
      tabs: {
        consumption: 'Consumo',
        demand: 'Demanda',
        powerFactor: 'Fator de Potência'
      },
      filters: {
        discretization: 'Resolução'
      },
      labels: {
        consumption: 'Consumo (kWh)',
        reativa: 'Reativa',
        contracted: 'Contratada',
        registered: 'Registrada',
        tolerance: 'Tolerância',
        reference: 'Referência (0.92)',
        inductive: 'Indutivo',
        capacitive: 'Capacitivo'
      }
    },
    historical: {
      compare: 'Comparar Gerações',
      sourceFilter: 'Filtro de Fonte',
      usageTitle: 'Uso Histórico',
      usageSubtitle: 'Comparação de Geração (kWh)',
      zeroAxis: 'Eixo Zero',
      shrinkToFit: 'Ajustar aos Dados'
    },
    ops: {
      title: 'Resumo de Operações',
      subtitle: 'Transações de mercado e contratos',
      purchase: 'Compra',
      sale: 'Venda',
      assignment: 'Cessão',
      loading: 'Processando Dados de Mercado...',
      months: 'Meses',
      allMonths: 'Todos os Meses',
      allUnits: 'Todas as Unidades',
      table: {
        month: 'Mês',
        unit: 'Unidade',
        op: 'Operação',
        counterparty: 'Contraparte',
        amount: 'Montante',
        price: 'Preço',
        total: 'Valor Total'
      }
    },
    news: {
      title: 'Notícias do Setor',
      subtitle: 'Fique atualizado com as tendências do mercado',
      article: 'Artigo',
      by: 'Por',
      processing: 'Carregando notícias...',
      scrollForMore: 'Role para mais'
    },
    sector: {
      title: 'Informação Setorial',
      subtitle: 'Baixe relatórios e atualizações regulatórias',
      downloadBtn: 'Baixar Relatório',
      error: 'Relatório ainda não disponível.'
    },
    pld: {
      title: 'Preço PLD',
      subtitle: 'Monitoramento do Preço de Liquidação das Diferenças',
      loading: 'Carregando dados de preços...',
      sync: 'Sincronizar Preços',
      regions: {
        north: 'Norte',
        ne: 'NE',
        se: 'SE/CO',
        south: 'Sul'
      },
      tabs: {
        history: 'Histórico',
        daily: 'Diário',
        hourly: 'Horário'
      }
    },
    login: {
      subtitle: 'Bem-vindo de volta à Smart Energia',
      signUpSubtitle: 'Junte-se à nossa rede de eficiência energética',
      resetSubtitle: 'Recupere o acesso à sua conta',
      resetSuccess: 'Link de redefinição de senha enviado ao seu e-mail',
      fullName: 'Nome Completo',
      placeholderName: 'João Silva',
      identity: 'Endereço de E-mail',
      placeholderEmail: 'email@exemplo.com.br',
      credentials: 'Senha',
      placeholderPassword: '••••••••',
      confirmPassword: 'Confirmar Senha',
      keepLoggedIn: 'Manter-me conectado',
      recovery: 'Esqueceu a senha?',
      signIn: 'Entrar',
      createAccount: 'Criar Conta',
      sendReset: 'Enviar Link',
      newHere: 'Novo na Smart Energia?',
      alreadyHaveAccount: 'Já possui uma conta?'
    },
    policy: {
      lastUpdated: 'Outubro de 2023',
      title: 'Privacidade e Termos',
      intro: 'Valorizamos a privacidade e segurança dos seus dados. Ao usar nossa plataforma, você concorda com nossas práticas de tratamento de dados.',
      point1Title: 'Eficiência Primeiro',
      point1Desc: 'Usamos seus dados para otimizar o consumo de energia e reduzir custos.',
      point2Title: 'Armazenamento Seguro',
      point2Desc: 'Suas informações são criptografadas e armazenadas em servidores seguros.',
      point3Title: 'Controle de Dados',
      point3Desc: 'Você tem controle total sobre seu histórico de telemetria e preferências.',
      point4Title: 'Compliance',
      point4Desc: 'Seguimos a LGPD e padrões internacionais de privacidade.',
      agreeNote: 'Ao clicar em concordar, você confirma que leu e aceitou nossos Termos de Uso e Política de Privacidade.',
      agree: 'Eu Concordo',
      disagree: 'Não Concordo'
    },
    static: {
      infoUnavailable: 'Informações temporariamente indisponíveis.',
      checkBackLater: 'Por favor, tente atualizar a página ou volte mais tarde.',
      noFaq: 'Nenhuma pergunta frequente disponível.'
    }
  },
  en: {
    nav: {
      dashboard: 'Overview',
      economy: 'Economy',
      telemetry: 'Telemetry',
      operation_summary: 'Ops Summary',
      news: 'News',
      pld: 'PLD Price',
      sectorial_info: 'Sector Info',
      notifications: 'Notifications',
      about_us: 'About Us',
      faq: 'FAQ',
      settings: 'Settings',
      premium: 'Premium',
      logout: 'Log Out'
    },
    common: {
      all: 'All',
      units: 'Units',
      allUnits: 'All Units',
      date: 'Date',
      loading: 'Loading...',
      noData: 'No data available.',
      download: 'Download',
      back: 'Back',
      verified: 'Verified by Provider',
      locked: 'Identity Locked',
      refresh: 'Refresh',
      reload: 'Reload',
      updating: 'Updating...',
      fetching: 'Fetching...',
      tryAgain: 'Try Again',
      more: 'More'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage account & preferences',
      profile: 'Account Profile',
      premium: 'Premium Subscriber',
      edit: 'Manage',
      accountID: 'Account Identifier',
      identityNotice: 'Managed by central provider',
      appearance: 'Appearance',
      theme: 'Theme Preference',
      themeDesc: 'Choose your visual style',
      language: 'Language',
      languageDesc: 'Preferred app language',
      notifications: 'Notifications',
      alerts: 'Usage Alerts',
      alertsDesc: 'Notify when over limit',
      summary: 'Weekly Summary',
      summaryDesc: 'Monday cost reports',
      logout: 'Log Out',
      version: 'Smart Energia Insight • v2.0.4 • Build 108'
    },
    profile: {
      title: 'My Profile',
      subtitle: 'Verified information',
      personalDetails: 'Personal Details',
      name: 'Legal Name',
      email: 'Email Address',
      membership: 'Plan Status',
      membershipDesc: 'Active since 2023',
      save: 'Close',
      cancel: 'Back',
      verifiedUser: 'Verified User'
    },
    dashboard: {
      title: 'Overview',
      subtitle: 'Performance at a glance',
      source: 'Source',
      sources: { All: 'All', Solar: 'Solar', Grid: 'Grid', Battery: 'Battery' },
      stats: { usage: 'Usage', cost: 'Cost', avg: 'Avg', economyTitle: 'Economy' },
      charts: { 
        usageTrend: 'Usage Trend', 
        costVsFree: 'Cost vs Market', 
        captive: 'Captive', 
        free: 'Free', 
        economy: 'Economy',
        annualGross: 'Annual Gross Economy',
        monthlyGross: 'Monthly Gross Economy',
        monthlySavings: 'Savings History',
        captiveVsFree: 'Captive x Livre',
        estimates: 'Estimates Comparison',
        mwhPrice: 'Price per MWh',
        indicator: 'Indicator History'
      },
      accumulated: 'Current Accumulated',
      refreshAll: 'Update Everything',
      refreshingAll: 'Refreshing All...',
      pldUnit: 'R$/MWh',
      ai: { 
        title: 'AI Insights', 
        subtitle: 'Gemini Analysis', 
        refresh: 'Update', 
        loading: 'Thinking...', 
        default: 'Awaiting data...',
        prompt: 'Click the Refresh icon above to generate AI Insights for your current energy data.'
      }
    },
    economy: {
      title: 'Economic Performance',
      subtitle: 'Analyze your savings and market trends',
      emptyTitle: "Where's the data?",
      emptySubtitle: 'No records found for the selected period.',
      tabs: {
        annual: 'Annual Gross',
        monthly: 'Monthly Gross',
        captiveVsFree: 'Captive vs Free',
        costMWh: 'Cost per MWh'
      }
    },
    telemetry: {
      title: 'Telemetry',
      subtitle: 'Real-time consumption and technical data',
      historicalNotice: 'Historical View: Displaying points from previous period (no current data found).',
      tabs: {
        consumption: 'Consumption',
        demand: 'Demand',
        powerFactor: 'Factor de Potencia'
      },
      filters: {
        discretization: 'Resolution'
      },
      labels: {
        consumption: 'Consumption (kWh)',
        reativa: 'Reactive',
        contracted: 'Contracted',
        registered: 'Registered',
        tolerance: 'Tolerance',
        reference: 'Reference (0.92)',
        inductive: 'Inductive',
        capacitive: 'Capacitive'
      }
    },
    historical: {
      compare: 'Compare Generations',
      sourceFilter: 'Source Filter',
      usageTitle: 'Historical Usage',
      usageSubtitle: 'Generation Comparison (kWh)',
      zeroAxis: 'Zero Axis',
      shrinkToFit: 'Shrink to Fit'
    },
    ops: {
      title: 'Operation Summary',
      subtitle: 'Market transactions and contracts',
      purchase: 'Purchase',
      sale: 'Sale',
      assignment: 'Assignment',
      loading: 'Processing Market Data...',
      months: 'Months',
      allMonths: 'All Months',
      allUnits: 'All Units',
      table: {
        month: 'Month',
        unit: 'Unit',
        op: 'Operation',
        counterparty: 'Counterparty',
        amount: 'Amount',
        price: 'Price',
        total: 'Total Value'
      }
    },
    news: {
      title: 'Energy News',
      subtitle: 'Stay updated with sector trends',
      article: 'Article',
      by: 'By',
      processing: 'Loading news...',
      scrollForMore: 'Scroll for more'
    },
    sector: {
      title: 'Sectorial Information',
      subtitle: 'Download reports and regulatory updates',
      downloadBtn: 'Download Report',
      error: 'Report not available yet.'
    },
    pld: {
      title: 'PLD Price',
      subtitle: 'Market Clearing Price monitoring',
      loading: 'Loading price data...',
      sync: 'Sync Price Data',
      regions: {
        north: 'North',
        ne: 'NE',
        se: 'SE/CO',
        south: 'South'
      },
      tabs: {
        history: 'Historical',
        daily: 'Daily',
        hourly: 'Hourly'
      }
    },
    login: {
      subtitle: 'Welcome back to Smart Energia',
      signUpSubtitle: 'Join our energy efficiency network',
      resetSubtitle: 'Recover your account access',
      resetSuccess: 'Password reset link sent to your email',
      fullName: 'Full Name',
      placeholderName: 'John Doe',
      identity: 'Email Address',
      placeholderEmail: 'email@example.com',
      credentials: 'Password',
      placeholderPassword: '••••••••',
      confirmPassword: 'Confirm Password',
      keepLoggedIn: 'Keep me logged in',
      recovery: 'Forgot password?',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      sendReset: 'Send Reset Link',
      newHere: 'New to Smart Energia?',
      alreadyHaveAccount: 'Already have an account?'
    },
    policy: {
      lastUpdated: 'October 2023',
      title: 'Privacy & Terms',
      intro: 'We value your data privacy and security. By using our platform, you agree to our data handling practices.',
      point1Title: 'Efficiency First',
      point1Desc: 'We use your data to optimize energy consumption and reduce costs.',
      point2Title: 'Secure Storage',
      point2Desc: 'Your information is encrypted and stored in secure data centers.',
      point3Title: 'Data Control',
      point3Desc: 'You have full control over your telemetry history and preferences.',
      point4Title: 'Compliance',
      point4Desc: 'We follow LGPD and international privacy standards.',
      agreeNote: 'By clicking agree, you confirm that you have read and accepted our Terms of Use and Privacy Policy.',
      agree: 'I Agree',
      disagree: 'I Disagree'
    },
    static: {
      infoUnavailable: 'Information temporarily unavailable.',
      checkBackLater: 'Please try refreshing the page or check back later.',
      noFaq: 'No frequently asked questions available.'
    }
  },
  es: {
    nav: {
      dashboard: 'Resumen',
      economy: 'Economía',
      telemetry: 'Telemetría',
      operation_summary: 'Ops Resumen',
      news: 'Noticias',
      pld: 'Precio PLD',
      sectorial_info: 'Info Sector',
      notifications: 'Notificaciones',
      about_us: 'Sobre Nosotros',
      faq: 'FAQ',
      settings: 'Ajustes',
      premium: 'Premium',
      logout: 'Salir'
    },
    common: {
      all: 'Todas',
      units: 'Unidades',
      allUnits: 'Todas las Unidades',
      date: 'Fecha',
      loading: 'Cargando...',
      noData: 'Sin datos.',
      download: 'Bajar',
      back: 'Volver',
      verified: 'Verificado por Proveedor',
      locked: 'Identidad Bloqueada',
      refresh: 'Actualizar',
      reload: 'Recargar',
      updating: 'Actualizando...',
      fetching: 'Buscando...',
      tryAgain: 'Intentar de Nuevo',
      more: 'Más'
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Gestionar cuenta y preferencias',
      profile: 'Perfil de Cuenta',
      premium: 'Suscriptor Premium',
      edit: 'Gestionar',
      accountID: 'Identificador de Cuenta',
      identityNotice: 'Gestionado por proveedor central',
      appearance: 'Apariencia',
      theme: 'Preferencia de Tema',
      themeDesc: 'Elija su estilo visual',
      language: 'Idioma',
      languageDesc: 'Idioma de la app',
      notifications: 'Notificaciones',
      alerts: 'Alertas de Uso',
      alertsDesc: 'Avisar al exceder límite',
      summary: 'Resumen Semanal',
      summaryDesc: 'Informes de costo los lunes',
      logout: 'Cerrar Sesión',
      version: 'Smart Energia Insight • v2.0.4 • Build 108'
    },
    profile: {
      title: 'Mi Perfil',
      subtitle: 'Información verificada',
      personalDetails: 'Detalles Personales',
      name: 'Nombre Legal',
      email: 'Correo Electrónico',
      membership: 'Estado del Plan',
      membershipDesc: 'Ativo desde 2023',
      save: 'Cerrar',
      cancel: 'Volver',
      verifiedUser: 'Usuario Verificado'
    },
    dashboard: {
      title: 'Resumen',
      subtitle: 'Rendimiento de un vistazo',
      source: 'Fuente',
      sources: { All: 'Todas', Solar: 'Solar', Grid: 'Red', Battery: 'Batería' },
      stats: { usage: 'Uso', cost: 'Costo', avg: 'Prom', economyTitle: 'Economía' },
      charts: { 
        usageTrend: 'Tendencia de Uso', 
        costVsFree: 'Costo x Mercado', 
        captive: 'Cautivo', 
        free: 'Libre', 
        economy: 'Economía',
        annualGross: 'Economía Anual Bruta',
        monthlyGross: 'Economía Mensual Bruta',
        monthlySavings: 'Historial de Ahorros',
        captiveVsFree: 'Cautivo x Livre',
        estimates: 'Comparación de Estimaciones',
        mwhPrice: 'Precio por MWh',
        indicator: 'Historial de Indicadores'
      },
      accumulated: 'Acumulado Actual',
      refreshAll: 'Actualizar Todo',
      refreshingAll: 'Actualizando Todo...',
      pldUnit: 'R$/MWh',
      ai: { 
        title: 'Insights de IA', 
        subtitle: 'Análisis Gemini', 
        refresh: 'Actualizar', 
        loading: 'Pensando...', 
        default: 'Esperando datos...',
        prompt: 'Haga clic en el icono de Actualizar arriba para generar Insights de IA para sus datos de energía actuales.'
      }
    },
    economy: {
      title: 'Rendimiento Económico',
      subtitle: 'Analice sus ahorros y tendencias del mercado',
      emptyTitle: "¿Dónde están los datos?",
      emptySubtitle: 'No se encontraron registros para el período seleccionado.',
      tabs: {
        annual: 'Bruto Anual',
        monthly: 'Bruto Mensual',
        captiveVsFree: 'Cautivo vs Libre',
        costMWh: 'Costo por MWh'
      }
    },
    telemetry: {
      title: 'Telemetría',
      subtitle: 'Consumo en tempo real y datos técnicos',
      historicalNotice: 'Vista Histórica: Mostrando puntos del período anterior (no se encontraron datos actuales).',
      tabs: {
        consumption: 'Consumo',
        demand: 'Demanda',
        powerFactor: 'Factor de Potencia'
      },
      filters: {
        discretization: 'Resolución'
      },
      labels: {
        consumption: 'Consumo (kWh)',
        reativa: 'Reactiva',
        contracted: 'Contratada',
        registered: 'Registrada',
        tolerance: 'Tolerancia',
        reference: 'Referencia (0.92)',
        inductive: 'Inductivo',
        capacitive: 'Capacitativo'
      }
    },
    historical: {
      compare: 'Comparar Gerações',
      sourceFilter: 'Filtro de Fonte',
      usageTitle: 'Uso Histórico',
      usageSubtitle: 'Comparación de Generación (kWh)',
      zeroAxis: 'Eje Cero',
      shrinkToFit: 'Ajustar a los Datos'
    },
    ops: {
      title: 'Resumen de Operaciones',
      subtitle: 'Transacciones de mercado e contratos',
      purchase: 'Compra',
      sale: 'Venda',
      assignment: 'Cesión',
      loading: 'Procesando Datos de Mercado...',
      months: 'Meses',
      allMonths: 'Todos los Meses',
      allUnits: 'Todas las Unidades',
      table: {
        month: 'Mes',
        unit: 'Unidad',
        op: 'Operación',
        counterparty: 'Contraparte',
        amount: 'Monto',
        price: 'Precio',
        total: 'Valor Total'
      }
    },
    news: {
      title: 'Noticias del Sector',
      subtitle: 'Manténgase actualizado con las tendencias del mercado',
      article: 'Artículo',
      by: 'Por',
      processing: 'Cargando noticias...',
      scrollForMore: 'Desliza para más'
    },
    sector: {
      title: 'Información Sectorial',
      subtitle: 'Descargue informes y actualizaciones regulatorias',
      downloadBtn: 'Descargar Informe',
      error: 'Informe aún no disponible.'
    },
    pld: {
      title: 'Precio PLD',
      subtitle: 'Monitoramiento del Precio de Liquidación de Diferencias',
      loading: 'Cargando datos de precios...',
      sync: 'Sincronizar Precios',
      regions: {
        north: 'Norte',
        ne: 'NE',
        se: 'SE/CO',
        south: 'Sur'
      },
      tabs: {
        history: 'Historial',
        daily: 'Diario',
        hourly: 'Horario'
      }
    },
    login: {
      subtitle: 'Bienvenido de nuevo a Smart Energia',
      signUpSubtitle: 'Únase a nuestra red de eficiencia energética',
      resetSubtitle: 'Recupere el acceso a su cuenta',
      resetSuccess: 'Enlace de restablecimiento de contraseña enviado a su correo',
      fullName: 'Nombre Completo',
      placeholderName: 'Juan Pérez',
      identity: 'Correo Electrónico',
      placeholderEmail: 'correo@ejemplo.com',
      credentials: 'Password',
      placeholderPassword: '••••••••',
      confirmPassword: 'Confirmar Contraseña',
      keepLoggedIn: 'Mantener sesión iniciada',
      recovery: '¿Olvidó su contraseña?',
      signIn: 'Entrar',
      createAccount: 'Crear Cuenta',
      sendReset: 'Enviar Enlace',
      newHere: '¿Nuevo en Smart Energia?',
      alreadyHaveAccount: '¿Ya tienes una cuenta?'
    },
    policy: {
      lastUpdated: 'Octubre de 2023',
      title: 'Privacidad y Términos',
      intro: 'Valoramos la privacidad y seguridad de sus datos. Al utilizar nuestra plataforma, usted acepta nuestras prácticas de manejo de datos.',
      point1Title: 'Eficiencia Primero',
      point1Desc: 'Utilizamos sus datos para optimizar el consumo energético y reducir costes.',
      point2Title: 'Almacenamiento Seguro',
      point2Desc: 'Su información está cifrada y almacenada en centros de datos seguros.',
      point3Title: 'Control de Datos',
      point3Desc: 'Tienes control total sobre tu historial de telemetría y preferencias.',
      point4Title: 'Cumplimiento',
      point4Desc: 'Cumplimos con LGPD y estándares internacionales de privacidad.',
      agreeNote: 'Al hacer clic en aceptar, confirma que ha leído y aceptado nuestros Términos de uso y Política de privacidad.',
      agree: 'Acepto',
      disagree: 'No acepto'
    },
    static: {
      infoUnavailable: 'Información temporalmente no disponible.',
      checkBackLater: 'Por favor, intente actualizar la página o vuelva más tarde.',
      noFaq: 'No hay preguntas frecuentes disponibles.'
    }
  }
};
