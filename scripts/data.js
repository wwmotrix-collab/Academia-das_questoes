// ═══════════════════════════════════════════════════════════
// Academia das Questões V2 — Activities Data
// ═══════════════════════════════════════════════════════════

const RANKS_DEFAULT = [
  { min:0,  max:5,  label:'Aprendiz',           icon:'🌿' },
  { min:6,  max:10, label:'Exploradora',         icon:'📘' },
  { min:11, max:15, label:'Guardiã',             icon:'💎' },
  { min:16, max:18, label:'Heroína da Academia', icon:'⚡' },
  { min:19, max:20, label:'Mestra das Questões', icon:'👑' }
];
const RANKS_A09 = [
  { min:0,  max:4,  label:'Aprendiz',           icon:'🌿' },
  { min:5,  max:8,  label:'Exploradora',         icon:'📘' },
  { min:9,  max:11, label:'Guardiã',             icon:'💎' },
  { min:12, max:13, label:'Heroína da Academia', icon:'⚡' },
  { min:14, max:15, label:'Mestra das Questões', icon:'👑' }
];
const RANKS_A10 = [
  { min:0,  max:9,  label:'Aprendiz',           icon:'🌿' },
  { min:10, max:17, label:'Exploradora',         icon:'📘' },
  { min:18, max:23, label:'Guardiã',             icon:'💎' },
  { min:24, max:28, label:'Heroína da Academia', icon:'⚡' },
  { min:29, max:30, label:'Mestra das Questões', icon:'👑' }
];

function getRankLabel(score, ranks) {
  for (const r of ranks) { if (score >= r.min && score <= r.max) return r.icon + ' ' + r.label; }
  return ranks[ranks.length-1].icon + ' ' + ranks[ranks.length-1].label;
}

const ACTIVITIES = [
// ────────────────────────────────────── 1
{
  id:1, title:'Atividade 1', subtitle:'Prova Oficial de Atividades',
  topic:'Revisão Geral', medal:'⚔️', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Leia com atenção','Observe pistas escondidas','Use lógica e calma','Não tenha medo de errar','Heróis aprendem tentando'],
  remember:{title:'VOCÊ É CAPAZ!',text:'A verdadeira aventura começa com sua <span class="highlight">determinação!</span>'},
  questions:[
    {n:1,type:'mc',section:'Reino da Interpretação',text:'A protagonista ficou nervosa antes da Grande Avaliação porque:',options:['Não gostava da Academia','Achava a prova impossível','Tinha medo de não conseguir','Não queria estudar'],correct:2},
    {n:2,type:'mc',section:'Reino da Interpretação',text:'O mascote ensina que interpretar significa:',options:['Decorar respostas','Entender o que está escondido nas palavras','Ler rapidamente','Responder sem pensar'],correct:1},
    {n:3,type:'mc',section:'Reino da Interpretação',text:'Quando o texto diz "Seu coração apertou", podemos entender que o personagem:',options:['Estava feliz','Ficou preocupado ou triste','Estava bravo','Sentiu sono'],correct:1},
    {n:4,type:'mc',section:'Reino da Interpretação',text:'No Reino da Interpretação, a heroína aprende principalmente a:',options:['Fazer contas rápidas','Entender emoções e pistas','Lutar contra monstros','Decorar textos'],correct:1},
    {n:5,type:'mc',section:'Reino da Interpretação',text:'Qual alternativa representa uma interpretação correta?',options:['Ler sem prestar atenção','Procurar pistas no texto','Chutar a resposta','Ignorar emoções'],correct:1},
    {n:6,type:'mc',section:'Torre dos Números',text:'Na Torre dos Números, a heroína descobriu que: 4 + 2 + 8 + 11 =',options:['23','24','25','26'],correct:2},
    {n:7,type:'mc',section:'Torre dos Números',text:'Qual número vem depois? 2 – 4 – 6 – 8 – __',options:['9','10','11','12'],correct:1},
    {n:8,type:'mc',section:'Torre dos Números',text:'Se o primeiro número é 4 e o segundo é a metade dele, o segundo número é:',options:['1','2','3','8'],correct:1},
    {n:9,type:'mc',section:'Torre dos Números',text:'Qual destas habilidades a heroína usou na Torre dos Números?',options:['Pintura','Decoração','Lógica','Corrida'],correct:2},
    {n:10,type:'mc',section:'Torre dos Números',text:'Resolver problemas passo a passo ajuda porque:',options:['Evita pensar','Organiza o raciocínio','Faz a prova acabar mais rápido','Elimina perguntas'],correct:1},
    {n:11,type:'mc',section:'Floresta das Frações',text:'2/4 equivale a:',options:['1/2','1/3','2/8','4/2'],correct:0},
    {n:12,type:'mc',section:'Floresta das Frações',text:'Qual fração representa metade?',options:['1/4','1/3','1/2','2/5'],correct:2},
    {n:13,type:'mc',section:'Floresta das Frações',text:'3/5 significa:',options:['3 partes de um total dividido em 5','5 dividido por 3','Apenas metade','Um número inteiro'],correct:0},
    {n:14,type:'mc',section:'Floresta das Frações',text:'Reduzir frações significa:',options:['Apagar números','Encontrar uma forma equivalente mais simples','Multiplicar tudo','Trocar sinais'],correct:1},
    {n:15,type:'mc',section:'Floresta das Frações',text:'Qual destas frações NÃO representa metade?',options:['1/2','2/4','3/6','2/3'],correct:3},
    {n:16,type:'mc',section:'Arena dos Gráficos',text:'Observe: Maçã=35, Banana=20, Uva=25, Laranja=15. Qual fruta recebeu MAIS votos?',options:['Banana','Maçã','Uva','Laranja'],correct:1},
    {n:17,type:'mc',section:'Arena dos Gráficos',text:'Quantos votos a banana recebeu?',options:['15','20','25','35'],correct:1},
    {n:18,type:'mc',section:'Arena dos Gráficos',text:'Qual fruta recebeu MENOS votos?',options:['Maçã','Banana','Uva','Laranja'],correct:3},
    {n:19,type:'mc',section:'Arena dos Gráficos',text:'35 + 20 =',options:['45','50','55','60'],correct:2},
    {n:20,type:'mc',section:'Arena dos Gráficos',text:'Os gráficos ajudam a:',options:['Confundir informações','Organizar e comparar dados','Eliminar números','Esconder respostas'],correct:1},
  ],
  extra:'Escreva sobre uma situação em que você precisou observar pistas para entender algo. O que você fez?',
  msg:'Você é capaz! A verdadeira aventura começa com sua determinação!',
  footer:'✦ O VERDADEIRO PODER NÃO ESTÁ EM NUNCA ERRAR... MAS EM CONTINUAR APRENDENDO. ✦'
},
// ────────────────────────────────────── 2
{
  id:2, title:'Atividade 2', subtitle:'As Emoções Escondidas',
  topic:'Inferência e Sentimentos', medal:'👁️', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Leia com atenção e observe as pistas.','As emoções ajudam a entender a história!','Use lógica, interpretação e calma.','Confie em você, heroína!'],
  remember:{title:'LEMBRE-SE!',text:'Por trás das palavras sempre existe um sentimento, uma intenção ou um segredo. <span class="highlight">Descubra-os!</span>'},
  questions:[
    {n:1,type:'mc',text:'Quando a protagonista segura firme a mochila antes da prova, isso mostra que ela:',options:['Estava distraída','Sentia nervosismo e determinação','Queria ir embora','Estava com raiva'],correct:1},
    {n:2,type:'mc',text:'O mascote diz: "As palavras têm emoções." Isso significa que:',options:['Toda frase está viva','Precisamos entender sentimentos e intenções','As letras possuem poderes mágicos','Apenas livros mágicos têm emoção'],correct:1},
    {n:3,type:'mc',text:'Leia: "Lucas procurou a carta várias vezes, mas não encontrou nada." Lucas ficou:',options:['Feliz','Confuso ou preocupado','Com sono','Bravo com o avô'],correct:1},
    {n:4,type:'mc',text:'O guardião diz que somente quem entende o que está escondido pode avançar. Isso quer dizer que:',options:['É preciso decorar tudo','É preciso interpretar e compreender','É preciso ter sorte','É preciso correr rápido'],correct:1},
    {n:5,type:'mc',text:'Qual alternativa representa uma interpretação CORRETA do texto?',options:['Ler as palavras sem pensar','Descobrir o que está além das palavras','Copiar as respostas dos outros','Ignorar detalhes da história'],correct:1},
    {n:6,type:'mc',text:'Quando a protagonista pensa "E se eu não conseguir?", ela está demonstrando:',options:['Confiança total','Dúvida e insegurança','Indiferença','Tristeza por causa da prova'],correct:1},
    {n:7,type:'mc',text:'A heroína conquistou 1 cristal roxo + 1 cristal azul + 1 cristal verde. Quantos cristais ao todo?',options:['1','2','3','4'],correct:2},
    {n:8,type:'mc',text:'Se ela conquistar mais 2 cristais, quantos terá ao todo?',options:['4','5','6','7'],correct:1},
    {n:9,type:'mc',text:'Observe a sequência: 4 – 2 – 8 – 11 – ? Qual número completa a sequência?',options:['12','13','14','15'],correct:2},
    {n:10,type:'mc',text:'Qual das situações abaixo mostra melhor que interpretar é ir além do óbvio?',options:['Ler apenas o título do texto','Prestar atenção nas pistas e detalhes','Olhar somente as imagens','Pular para o final da história'],correct:1},
    {n:11,type:'mc',text:'A maçã teve 35 votos e a laranja teve 15. Quantos votos a maçã teve a MAIS que a laranja?',options:['10','15','20','25'],correct:2},
    {n:12,type:'mc',text:'Se cada reino concedeu 1 cristal e a heroína conquistou 4 reinos, quantos cristais ela terá?',options:['2','3','4','5'],correct:2},
  ],
  extra:'Escreva com suas palavras: O que você aprendeu sobre interpretar textos e emoções?',
  msg:'Entender emoções é entender pessoas. E entender pessoas é um superpoder!',
  footer:'✦ Cada emoção descoberta te torna mais forte. Continue sua jornada! ✦'
},
// ────────────────────────────────────── 3
{
  id:3, title:'Atividade 3', subtitle:'Pistas Escondidas',
  topic:'Interpretação e Detalhes', medal:'🔍', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['As pistas estão em todo lugar!','Preste atenção nos detalhes.','Interprete, conecte e descubra.','Seu olhar atento é o seu maior poder!'],
  remember:{title:'LEMBRE-SE!',text:'As melhores respostas não estão sempre escritas de forma direta. <span class="highlight">Observe, conecte e descubra!</span>'},
  questions:[
    {n:1,type:'mc',text:'Releia: "O coração da heroína apertou, mas ela respirou fundo e continuou." Podemos entender que ela:',options:['Ficou feliz com a prova','Sentiu medo, mas não desistiu','Queria sair da Academia','Estava com raiva do mascote'],correct:1},
    {n:2,type:'mc',text:'O mascote diz: "Nem tudo que está escrito é o mais importante." Isso significa que:',options:['Devemos ignorar o que está escrito','Precisamos procurar o que está escondido entre as linhas','Só desenhos têm significado','O texto não tem valor'],correct:1},
    {n:3,type:'mc',text:'Leia: "A porta só se abrirá para quem compreender o que não foi dito." Isso quer dizer que precisamos:',options:['Ler mais rápido','Entender além das palavras','Decorar frases','Fechar os olhos'],correct:1},
    {n:4,type:'mc',text:'Lucas procurou a carta várias vezes e não encontrou nada. Ele provavelmente estava:',options:['Alegre e confiante','Tranquilo e calmo','Confuso ou preocupado','Entediado e animado'],correct:2},
    {n:5,type:'mc',text:'Qual alternativa mostra uma conclusão correta com base nas pistas?',options:['Se a porta está trancada, não há saída','Se a porta tem um enigma, é preciso resolver para avançar','Se há números, eles não importam','Se o texto é longo, é melhor pular'],correct:1},
    {n:6,type:'mc',text:'Leia: "Uma sombra passou rápido entre as árvores, mas ninguém viu de onde veio." Podemos entender que:',options:['Era um monstro muito grande','Algo misterioso estava por perto','Era apenas o mascote brincando','O vento moveu as árvores'],correct:1},
    {n:7,type:'mc',text:'No Reino da Interpretação, qual habilidade a heroína mais precisa usar para vencer?',options:['Força física','Magia sem usar a mente','Interpretação e atenção aos detalhes','Correr mais rápido que todos'],correct:2},
    {n:8,type:'mc',text:'Qual das situações abaixo NÃO é uma pista importante em um texto?',options:['Descrição do ambiente','Sentimentos dos personagens','Cores das roupas','Número da página'],correct:3},
    {n:9,type:'mc',text:'"— Você encontrou a chave? — Ainda não. Mas vi algo brilhando atrás da pedra grande..." O que podemos concluir?',options:['Ele já encontrou a chave','Ele desistiu de procurar','Ele está perto de encontrar algo importante','Ele não sabe onde procurar'],correct:2},
    {n:10,type:'mc',text:'Leia: "A heroína olhou para o mapa antigo e percebeu que faltava uma parte." Isso indica que:',options:['O mapa está completo e confiável','Falta informação, então é preciso investigar mais','Alguém rasgou o mapa por diversão','O mapa não funciona mais'],correct:1},
    {n:11,type:'mc',text:'A heroína conquistou 2 cristais roxos e 1 cristal verde. Quantos cristais ela tem ao todo?',options:['2','3','4','5'],correct:1},
    {n:12,type:'mc',text:'Sequência de cristais: roxo – azul – verde – roxo. Qual será o próximo?',options:['Roxo','Verde','Azul','Laranja'],correct:2},
  ],
  extra:'Escreva um pequeno trecho (2 ou 3 frases) com uma pista escondida para seus amigos interpretarem!',
  msg:'As maiores descobertas começam com um detalhe que quase ninguém vê. Confie no seu olhar!',
  footer:'✦ ATENÇÃO, CORAGEM E CURIOSIDADE: SUAS MAIORES ARMAS! ✦'
},
// ────────────────────────────────────── 4
{
  id:4, title:'Atividade 4', subtitle:'Ligações Secretas',
  topic:'Relações de Sentido', medal:'🔗', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Conecte ideias e encontre os sentidos escondidos!','Preste atenção nas relações entre as informações.','Use lógica, interpretação e imaginação.','Cada ligação correta te aproxima da vitória!'],
  remember:{title:'LEMBRE-SE!',text:'Ideias se conectam, detalhes se juntam e sentidos aparecem! <span class="highlight">Relacione as informações e descubra o que está além das palavras!</span>'},
  questions:[
    {n:1,type:'mc',text:'Leia: "A heroína respirou fundo, ajeitou a mochila e seguiu em frente, mesmo com medo." A heroína:',options:['Decidiu voltar para casa','Superou o medo e continuou','Pediu ajuda ao mascote','Desistiu da prova'],correct:1},
    {n:2,type:'mc',text:'O mascote diz: "Para interpretar, é preciso ligar pistas." Isso significa que devemos:',options:['Ler apenas o início do texto','Unir informações para entender melhor','Memorizar todas as palavras','Ignorar os detalhes'],correct:1},
    {n:3,type:'mc',text:'"A porta só se abrirá para quem entender o que não está escrito." Isso quer dizer que precisamos:',options:['Ler nas entrelinhas','Pular as partes difíceis','Contar as palavras do texto','Ler apenas o título'],correct:0},
    {n:4,type:'mc',text:'Quando Lucas não encontrou a carta do avô, ele provavelmente sentiu:',options:['Alegria','Tranquilidade','Decepção ou preocupação','Raiva do mascote'],correct:2},
    {n:5,type:'mc',text:'Qual ligação mostra a relação correta? "Estudar com atenção → Entender melhor"',options:['Causa e efeito','Oposição','Tempo','Dúvida'],correct:0},
    {n:6,type:'mc',text:'Leia: "O vento soprava forte, mas ela manteve o foco e não desistiu." A palavra "mas" indica:',options:['Adição','Explicação','Oposição','Conclusão'],correct:2},
    {n:7,type:'mc',text:'No Reino da Interpretação, a heroína aprende que o texto pode esconder:',options:['Tesouros reais','Emoções e intenções','Feitiços secretos','Monstros perigosos'],correct:1},
    {n:8,type:'mc',text:'"Choveu muito → As ruas ficaram molhadas". A ligação correta entre elas é:',options:['Causa e efeito','Comparação','Condição','Alternativa'],correct:0},
    {n:9,type:'mc',text:'Leia: "Ele procurou, procurou, mas a chave não estava em lugar nenhum." A repetição de "procurou" serve para mostrar que ele:',options:['Encontrou rápido','Estava cansado','Procurou por muito tempo','Não queria achar'],correct:2},
    {n:10,type:'mc',text:'"Treinar as habilidades → ___ nas provas"',options:['atrapalha','ajuda','não muda','complica'],correct:1},
    {n:11,type:'mc',text:'Leia: "Ela acreditava que poderia, mas uma vozinha dizia que era impossível." A heroína estava:',options:['Totalmente confiante','Triste demais para tentar','Dividida entre o medo e a esperança','Com raiva de todos'],correct:2},
    {n:12,type:'mc',text:'Qual ligação correta? Esforço→Alcançar objetivos; Estratégia→Melhor caminho; Atenção→Evita erros',options:['1–3, 2–2, 3–1','1–2, 2–3, 3–2','1–2, 2–3, 3–1','1–3, 2–1, 3–2'],correct:2},
  ],
  extra:'Escreva um pequeno parágrafo (3 a 4 frases) sobre uma situação em que você precisou ligar pistas para entender algo.',
  msg:'Conectar ideias é como montar um quebra-cabeça: juntas revelam algo incrível!',
  footer:'✦ HÁ SEMPRE UMA LIGAÇÃO QUE LEVA À VERDADE. OBSERVE, CONECTE E DESCUBRA! ✦'
},
// ────────────────────────────────────── 5
{
  id:5, title:'Atividade 5', subtitle:'Sequências e Padrões',
  topic:'Lógica Numérica', medal:'⏳', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Descubra a lógica por trás dos números!','Padrões estão em todo lugar.','Observe, analise e continue a sequência.','Cada resposta certa te aproxima da vitória!'],
  remember:{title:'LEMBRE-SE!',text:'Padrões e sequências seguem uma lógica. <span class="highlight">Encontre a regra, complete e avance!</span>'},
  questions:[
    {n:1,type:'mc',text:'Observe a sequência e descubra qual vem a seguir:',seq:'2 – 4 – 6 – 8 – ?',options:['9','10','11','12'],correct:1},
    {n:2,type:'mc',text:'Descubra o próximo número da sequência:',seq:'1 – 3 – 5 – 7 – ?',options:['8','9','10','11'],correct:1},
    {n:3,type:'mc',text:'Qual número completa corretamente a sequência?',seq:'5 – 10 – 15 – 20 – ?',options:['25','30','35','40'],correct:0},
    {n:4,type:'mc',text:'Qual alternativa mantém o padrão de somar 5 a cada número?',options:['5–10–14–18–22','5–10–15–20–25','5–9–13–17–21','5–11–17–23–29'],correct:1},
    {n:5,type:'mc',text:'Qual sequência segue o padrão de somar 3 a cada número?',options:['3–6–9–12–15','2–5–7–10–12','1–4–8–12–16','5–9–12–16–20'],correct:0},
    {n:6,type:'mc',text:'Qual sequência segue o padrão de multiplicar por 2?',options:['1–2–4–8–16','2–4–6–8–10','1–3–5–7–9','2–3–5–7–11'],correct:0},
    {n:7,type:'mc',text:'Observe os números e descubra o próximo:',seq:'10 – 8 – 6 – 4 – ?',options:['2','1','0','-2'],correct:0},
    {n:8,type:'mc',text:'Observe os desenhos: ★ ☆ ★ ★ ☆ ★ ? — Qual vem a seguir?',options:['★','☆','●','▲'],correct:0},
    {n:9,type:'mc',text:'Padrão de formas: ▲ ▼ ▲ ▼ ▲ ▼ ? — Qual forma completa a sequência?',options:['▲','▼','■','●'],correct:0},
    {n:10,type:'mc',text:'Sequência de cores: Roxo–Verde–Roxo–Roxo–Verde–Roxo–? Qual cor vem a seguir?',options:['Roxo','Verde','Azul','Amarelo'],correct:1},
    {n:11,type:'mc',text:'Qual sequência apresenta a regra de "subtrair 2" a cada passo?',options:['10–8–6–4–2','10–9–8–7–6','10–7–4–1–-2','10–6–3–1–-2'],correct:0},
    {n:12,type:'mc',text:'Desafio final! Qual é o próximo número?',seq:'3 – 6 – 12 – 24 – ?',options:['36','40','48','50'],correct:2},
  ],
  extra:'Crie uma sequência usando números ou desenhos que tenha uma regra. Peça para um amigo descobrir o próximo elemento!',
  msg:'A lógica é como um mapa secreto: quem entende os padrões, sempre encontra o caminho!',
  footer:'✦ OBSERVE, ANALISE E DESCUBRA: CADA PADRÃO É UM PASSO RUMO À SUA GRANDE VITÓRIA! ✦'
},
// ────────────────────────────────────── 6
{
  id:6, title:'Atividade 6', subtitle:'Frações Mágicas',
  topic:'Frações Básicas', medal:'🔵', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Frações representam partes do todo.','Entenda, simplifique e compare.','Preste atenção nos detalhes.','Cada resposta certa te aproxima da vitória!'],
  remember:{title:'LEMBRE-SE!',text:'Frações mostram partes de um todo. Para simplificar, dividimos numerador e denominador pelo mesmo número. <span class="highlight">Simplifique sempre que possível!</span>'},
  questions:[
    {n:1,type:'mc',text:'Qual fração representa a parte pintada? (2 de 4 partes)',options:['1/4','2/4','2/3','3/4'],correct:1},
    {n:2,type:'mc',text:'Qual fração representa a parte pintada? (3 de 8 partes de um círculo)',options:['2/8','3/8','4/8','5/8'],correct:1},
    {n:3,type:'mc',text:'Qual destas frações é equivalente a 1/2?',options:['1/3','2/3','2/4','3/5'],correct:2},
    {n:4,type:'mc',text:'Simplifique a fração 6/8.',options:['1/2','2/3','3/4','3/5'],correct:2},
    {n:5,type:'mc',text:'Qual fração NÃO é equivalente a 1/2?',options:['2/4','4/8','3/6','2/2'],correct:3},
    {n:6,type:'mc',text:'Um bolo dividido em 5 partes iguais — comemos 2 partes. Qual fração comemos?',options:['1/5','2/5','3/5','4/5'],correct:1},
    {n:7,type:'mc',text:'Simplifique a fração 9/12.',options:['1/2','2/3','3/4','4/6'],correct:2},
    {n:8,type:'mc',text:'Qual fração é maior? 2/5 ou 3/5',options:['2/5','3/5','São iguais','Não dá para saber'],correct:1},
    {n:9,type:'mc',text:'Ordene da menor para a maior: 3/4, 1/2, 2/4',options:['1/2–2/4–3/4','2/4–1/2–3/4','3/4–2/4–1/2','2/4–3/4–1/2'],correct:0},
    {n:10,type:'mc',text:'Complete: 1/4 = __/8',options:['1','2','4','6'],correct:1},
    {n:11,type:'mc',text:'Em um grupo de 20 alunos, 5 gostam de manga. Qual fração representa esses alunos?',options:['1/4','1/5','1/6','1/2'],correct:1},
    {n:12,type:'mc',text:'Simplifique 15/20 e escolha a fração equivalente entre as opções.',options:['1/2','2/3','3/4','4/5'],correct:2},
  ],
  extra:'Escreva duas frações diferentes que sejam equivalentes a 2/3. Mostre como você pensou!',
  msg:'Assim como nas frações, na vida também precisamos encontrar equilíbrio. Divida desafios, multiplique esforços e conquiste seus sonhos!',
  footer:'✦ ENTENDER, SIMPLIFICAR E COMPARAR: ESTE É O PODER DAS FRAÇÕES! ✦'
},
// ────────────────────────────────────── 7
{
  id:7, title:'Atividade 7', subtitle:'Frações em Ação',
  topic:'Equivalência e Comparação', medal:'½', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Use lógica, atenção e estratégia.','Cada fração tem um significado.','Simplifique, compare e resolva!','Cada resposta certa te aproxima da vitória!'],
  remember:{title:'LEMBRE-SE!',text:'Frações nos ajudam a dividir, comparar e entender partes de um todo! <span class="highlight">Observe, pense e escolha com sabedoria!</span>'},
  questions:[
    {n:1,type:'mc',text:'Qual fração representa a parte pintada? (3 de 5 partes)',options:['2/5','3/5','3/2','5/3'],correct:1},
    {n:2,type:'mc',text:'Qual fração representa a parte pintada? (1 de 6 partes de um círculo)',options:['1/6','2/6','3/6','5/6'],correct:0},
    {n:3,type:'mc',text:'Simplifique a fração 8/12.',options:['1/2','2/3','3/4','4/6'],correct:1},
    {n:4,type:'mc',text:'Qual fração é maior? 2/3 ou 3/5',options:['2/3','3/5','São iguais','Não dá para saber'],correct:0},
    {n:5,type:'mc',text:'Qual das frações abaixo é equivalente a 2/3?',options:['1/2','2/4','4/6','3/5'],correct:2},
    {n:6,type:'mc',text:'Qual das frações abaixo é equivalente a 3/4?',options:['1/2','2/4','6/8','2/3'],correct:2},
    {n:7,type:'mc',text:'Uma barra de chocolate dividida em 8 partes — Lucas comeu 3 partes. Qual fração ele comeu?',options:['3/8','3/5','5/8','8/3'],correct:0},
    {n:8,type:'mc',text:'Simplifique a fração 15/20.',options:['1/2','2/3','3/4','4/5'],correct:2},
    {n:9,type:'mc',text:'Quatro amigos dividiram igualmente uma pizza. Qual fração cada um recebeu?',options:['1/4','1/2','2/4','1/3'],correct:0},
    {n:10,type:'mc',text:'Complete a fração equivalente a 1/2: 1/2 = __/6',options:['1','2','3','4'],correct:2},
    {n:11,type:'mc',text:'Ordene da menor para a maior: 3/4, 1/2, 2/4, 1/4',options:['3/4–1/2–2/4–1/4','1/4–1/2–2/4–3/4','1/2–3/4–2/4–1/4','1/4–2/4–1/2–3/4'],correct:3},
    {n:12,type:'mc',text:'Qual figura mostra 2/3 da parte pintada? (2 de 3 partes coloridas)',options:['Figura A (2 de 3)','Figura B (1 de 3)','Figura C (3 de 3)','Figura D (1 de 2)'],correct:0},
  ],
  extra:'Use as frações 1/2, 1/4 e 1/6 para formar a maior fração possível somando-as. Qual fração você formou?',
  msg:'Frações parecem pequenas, mas têm um grande poder: ajudam a dividir, entender e unir!',
  footer:'✦ CADA FRAÇÃO APRENDIDA É UM PASSO RUMO À SABEDORIA. CONTINUE SUA JORNADA! ✦'
},
// ────────────────────────────────────── 8
{
  id:8, title:'Atividade 8', subtitle:'Frações em Desafio',
  topic:'Simplificação e Aplicação', medal:'¾', maxScore:20, xpBonus:50,
  ranks: RANKS_DEFAULT,
  rankTable:[{a:'0–5',r:'🌿 Aprendiz'},{a:'6–10',r:'📘 Exploradora'},{a:'11–15',r:'💎 Guardiã'},{a:'16–18',r:'⚡ Heroína da Academia'},{a:'19–20',r:'👑 Mestra das Questões'}],
  instructions:['Frações descrevem partes do todo.','Entenda, compare e simplifique.','Preste atenção nos detalhes!','Cada resposta certa te aproxima da vitória!'],
  remember:{title:'LEMBRE-SE!',text:'Frações equivalentes representam a mesma quantidade, mesmo que numerador e denominador sejam diferentes. <span class="highlight">Simplifique sempre que possível!</span>'},
  questions:[
    {n:1,type:'mc',text:'Qual fração representa a parte pintada? (5 de 8 partes)',options:['5/8','3/8','5/3','8/5'],correct:0},
    {n:2,type:'mc',text:'Qual fração representa a parte pintada? (3 de 10 partes)',options:['7/10','3/10','7/3','10/7'],correct:1},
    {n:3,type:'mc',text:'Qual fração representa a parte pintada? (3 de 5 partes em grade)',options:['6/10','3/5','6/5','10/6'],correct:1},
    {n:4,type:'mc',text:'Simplifique a fração 12/18.',options:['1/3','2/3','3/4','4/6'],correct:1},
    {n:5,type:'mc',text:'Qual das frações abaixo é equivalente a 2/3?',options:['3/4','4/6','6/9','3/5'],correct:2},
    {n:6,type:'mc',text:'Simplifique a fração 18/24.',options:['1/2','2/3','3/4','4/6'],correct:2},
    {n:7,type:'mc',text:'Qual das frações abaixo é a maior?',options:['2/3','3/5','4/7','5/9'],correct:0},
    {n:8,type:'mc',text:'Coloque na ordem crescente: 2/5, 3/10, 1/2',options:['3/10–2/5–1/2','2/5–3/10–1/2','3/10–1/2–2/5','1/2–2/5–3/10'],correct:0},
    {n:9,type:'mc',text:'Três amigos dividiram igualmente um baú com 12 cristais. Quantos cristais cada um recebeu?',options:['2','3','4','6'],correct:2},
    {n:10,type:'mc',text:'Complete a fração para que seja equivalente a 3/5: 3/5 = __/25',options:['12','13','15','18'],correct:2},
    {n:11,type:'mc',text:'Um bolo com 8 partes — Lucas comeu 3 e Ana comeu 2. Qual fração do bolo sobrou?',options:['1/8','3/8','4/8','5/8'],correct:1},
    {n:12,type:'mc',text:'Qual fração é equivalente a 2/4 e está na forma mais simplificada?',options:['1/2','2/8','3/6','4/8'],correct:0},
  ],
  extra:'Crie uma fração equivalente a 3/4 com denominador 20. Qual é o numerador dessa fração?',
  msg:'Dominar as frações é como aprender a dividir recursos, tempo e desafios!',
  footer:'✦ FRAÇÕES ESTÃO EM TUDO! ENTENDA, SIMPLIFIQUE E APLIQUE! ✦'
},
// ────────────────────────────────────── 9
{
  id:9, title:'Atividade 9', subtitle:'Missão Completa',
  topic:'Revisão Mista', medal:'5', maxScore:15, xpBonus:50,
  ranks: RANKS_A09,
  rankTable:[{a:'0–4',r:'🌿 Aprendiz'},{a:'5–8',r:'📘 Exploradora'},{a:'9–11',r:'💎 Guardiã'},{a:'12–13',r:'⚡ Heroína da Academia'},{a:'14–15',r:'👑 Mestra das Questões'}],
  instructions:['Leia cada questão com atenção.','Use lógica, interpretação e estratégia.','Mostre todo o seu conhecimento!','Cada resposta certa te aproxima da vitória final!'],
  remember:{title:'LEMBRE-SE!',text:'Nesta missão, você usará tudo o que aprendeu: <span class="highlight">Interpretação, Lógica, Frações e Sequências</span>'},
  questions:[
    {n:1,type:'mc',text:'"Entendi que cada palavra tem um sentimento por trás." Isso significa que:',options:['Palavras têm vida própria','Devemos perceber emoções e intenções','Só livros mágicos têm sentimentos','As letras podem mudar de forma'],correct:1},
    {n:2,type:'mc',text:'Qual emoção melhor representa o mascote quando diz "Você está indo muito bem!"?',options:['Tristeza','Alegria','Medo','Raiva'],correct:1},
    {n:3,type:'mc',text:'Leia: "Lucas vasculhou o baú várias vezes, mas não encontrou a carta do avô." Lucas está:',options:['Feliz','Confuso ou preocupado','Cansado','Indiferente'],correct:1},
    {n:4,type:'mc',text:'Qual fração representa a parte pintada? (3 de 6 partes)',options:['2/6','3/6','4/6','5/6'],correct:1},
    {n:5,type:'mc',text:'Qual fração representa a parte pintada? (3 de 8 partes de um círculo)',options:['2/8','3/8','4/8','5/8'],correct:1},
    {n:6,type:'mc',text:'Um bolo dividido em 10 partes — comemos 3 partes. Qual fração comemos?',options:['2/10','3/10','4/10','5/10'],correct:1},
    {n:7,type:'mc',text:'Qual sequência está correta (aumenta de 2 em 2)?',options:['2–4–6–8–10','1–3–5–7–9','2–3–5–7–11','5–10–15–20–25'],correct:0},
    {n:8,type:'mc',text:'Observe a sequência e descubra o próximo número:',seq:'3 – 6 – 9 – 12 – ?',options:['13','14','15','16'],correct:2},
    {n:9,type:'mc',text:'Qual sequência segue o padrão de multiplicar por 2?',options:['1–2–4–6–8','1–2–4–8–16','2–4–6–8–10','1–3–6–9–12'],correct:1},
    {n:10,type:'mc',text:'Gráfico de frutas favoritas: Maçã=8, Banana=6, Uva=4, Laranja=2. Qual fruta foi a menos votada?',options:['Maçã','Banana','Uva','Laranja'],correct:3},
    {n:11,type:'mc',text:'Quantos alunos a mais preferem maçã do que laranja? (Maçã=8, Laranja=2)',options:['2','4','6','8'],correct:2},
    {n:12,type:'mc',text:'Se cada aluno votasse em DUAS frutas (20 alunos × 2), quantos votos teríamos ao todo?',options:['96','12','20','40'],correct:3},
    {n:13,type:'mc',text:'Simplifique a fração 12/18.',options:['1/6','2/3','3/4','4/9'],correct:1},
    {n:14,type:'mc',text:'Ordene as frações da menor para a maior: 1/4, 2/3, 1/2',options:['1/4–1/2–2/3','1/2–1/4–2/3','1/4–2/3–1/2','2/3–1/2–1/4'],correct:0},
    {n:15,type:'mc',text:'Um livro tem 240 páginas. Lucas já leu 3/5 do livro. Quantas páginas ele já leu?',options:['96','120','144','180'],correct:2},
  ],
  extra:'Crie uma questão usando frações ou sequências e troque com um amigo para ele resolver!',
  msg:'Você chegou muito longe! Cada desafio vencido fortalece sua mente, seu coração e seu espírito.',
  footer:'✦ VOCÊ USOU TUDO O QUE APRENDEU NESTA MISSÃO! CONFIE EM SI MESMA! ✦'
},
// ────────────────────────────────────── 10
{
  id:10, title:'Atividade 10', subtitle:'Grande Avaliação Final',
  topic:'Simulado Final do Capítulo', medal:'10', maxScore:30, xpBonus:100,
  ranks: RANKS_A10,
  rankTable:[{a:'0–9',r:'🌿 Aprendiz'},{a:'10–17',r:'📘 Exploradora'},{a:'18–23',r:'💎 Guardiã'},{a:'24–28',r:'⚡ Heroína da Academia'},{a:'29–30',r:'👑 Mestra das Questões'}],
  instructions:['Esta é a missão final do Capítulo 1!','Leia com atenção, pense com calma e mostre tudo o que aprendeu.','Use lógica, interpretação e estratégia.','Cada resposta certa te aproxima do título máximo da Academia!'],
  remember:{title:'LEMBRE-SE!',text:'Você chegou até aqui com coragem e determinação. <span class="highlight">Confie no que aprendeu, respire fundo e faça o seu melhor!</span>'},
  questions:[
    {n:1,type:'mc',text:'Leia: "A heroína respirou fundo, ajustou sua capa e entrou na biblioteca. Sabia que grandes desafios a esperavam." O que esse trecho mostra?',options:['Ela estava com sono','Ela estava preparada para desafios','Ela não gostava de livros','Ela ia embora do castelo'],correct:1},
    {n:2,type:'mc',text:'Qual emoção melhor representa a heroína antes da grande missão?',options:['Tristeza','Medo','Determinação','Raiva'],correct:2},
    {n:3,type:'mc',text:'Qual fração representa a parte pintada? (5 de 8 partes)',options:['2/8','3/8','5/8','6/8'],correct:2},
    {n:4,type:'mc',text:'Simplifique a fração 18/24.',options:['1/2','2/3','3/4','4/6'],correct:2},
    {n:5,type:'mc',text:'Se a heroína tem 3 cristais roxos, 2 azuis e 4 verdes, quantos cristais ela tem ao todo?',options:['6','7','8','9'],correct:3},
    {n:6,type:'mc',text:'Um bolo dividido em 8 partes — a heroína comeu 3. Qual fração do bolo ainda sobrou?',options:['3/8','4/8','5/8','6/8'],correct:2},
    {n:7,type:'mc',text:'Qual sequência segue o padrão de somar 2 a cada número?',options:['1–2–3–4–5','2–4–6–8–10','1–3–5–7–9','3–5–7–9–11'],correct:3},
    {n:8,type:'mc',text:'Qual das frases abaixo está no sentido figurado?',options:['O livro caiu da mesa','As ideias voaram em sua mente','O gato dorme no sofá','A mochila é azul'],correct:1},
    {n:9,type:'mc',text:'Ordene da menor para a maior: 3/4, 1/2, 2/4, 1/4',options:['1/4–1/2–2/4–3/4','1/4–2/4–1/2–3/4','1/2–2/4–3/4–1/4','3/4–2/4–1/2–1/4'],correct:1},
    {n:10,type:'mc',text:'Gráfico de livros lidos: Lucas=8, Mia=6, Sofia=4, Enzo=2. Quem leu mais livros?',options:['Lucas','Mia','Sofia','Enzo'],correct:0},
    {n:11,type:'mc',text:'Se cada aluno do gráfico lê mais 2 livros, quantos livros no total eles terão lido?',options:['20','22','24','28'],correct:3},
    {n:12,type:'mc',text:'Lucas: "Não encontrei a carta em lugar nenhum!" Mestre: "Talvez você não esteja olhando onde deveria." O que o mestre quer dizer?',options:['A carta não existe','Lucas não procurou com atenção','A carta está escondida à vista','O mestre pegou a carta'],correct:2},
    {n:13,type:'mc',text:'Simplifique a fração 15/20.',options:['1/2','2/3','3/4','4/5'],correct:2},
    {n:14,type:'mc',text:'Uma poção: 1/2 de água + 1/4 de suco de fruta. Qual fração representa o total?',options:['1/4','1/2','2/4','3/4'],correct:3},
    {n:15,type:'tf',text:'Verdadeiro (V) ou Falso (F)?',tfItems:[
      {text:'Frações representam partes de um todo.', correct:'V'},
      {text:'1/2 é maior que 2/4.',                  correct:'F'},
      {text:'Todo número par termina em 0.',          correct:'F'},
      {text:'3 + 3 + 3 é diferente de 3 × 3.',       correct:'V'},
    ]},
  ],
  extra:'Crie uma pequena história usando: uma fração, um sentimento e um desafio. Troque com um amigo para ele descobrir qual é qual!',
  msg:'Independentemente do resultado, você já é uma vencedora por ter chegado até aqui. Continue estudando e brilhando!',
  footer:'✦ MISSÃO CUMPRIDA! ANALISE SUAS RESPOSTAS, APRENDA COM OS ERROS E PREPARE-SE PARA OS PRÓXIMOS CAPÍTULOS! ✦'
},
];
