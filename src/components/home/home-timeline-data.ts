import { Bot, TrendingUp, Rocket, Megaphone } from "lucide-react";

import type { TimelineItem } from "@/components/ui/radial-orbital-timeline";

export const neurautomationFrentes: TimelineItem[] = [
  {
    id: 1,
    title: "Automação B2B",
    date: "Frente 01",
    content:
      "Automação de atendimento, captação e reativação de clientes com IA — WhatsApp, agentes de IA e CRM operando 24/7 para negócios de diversos segmentos.",
    category: "Automação",
    icon: Bot,
    relatedIds: [2, 4],
    status: "completed",
    energy: 90,
  },
  {
    id: 2,
    title: "Afiliado Google Ads",
    date: "Frente 02",
    content:
      "Operação profissional de tráfego pago e performance, gerindo campanhas de afiliados com foco em ROI e ROAS.",
    category: "Performance",
    icon: TrendingUp,
    relatedIds: [1, 3],
    status: "completed",
    energy: 85,
  },
  {
    id: 3,
    title: "Produtor de Infoprodutos",
    date: "Frente 03",
    content:
      "Criação, lançamento e escala de produtos digitais próprios, do posicionamento à monetização.",
    category: "Produto",
    icon: Rocket,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 70,
  },
  {
    id: 4,
    title: "Agência de Marketing",
    date: "Frente 04",
    content:
      "Serviços de marketing digital prestados a terceiros: estratégia, conteúdo e tráfego pago sob medida para cada cliente.",
    category: "Serviços",
    icon: Megaphone,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 75,
  },
];
