// src/modules/scheduler/utils/calendarLocalizer.ts

import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa o locale PT-BR

const locales = {
  'pt-BR': ptBR,
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});