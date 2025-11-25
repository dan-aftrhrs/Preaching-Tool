export interface SermonSectionData {
  id: string;
  title: string;
  label: string;
  subtitle: string;
  placeholder: string;
  color: string; // Tailwind color class part (e.g., 'blue', 'amber')
  content: string;
  isExpanded: boolean;
}

export interface SermonState {
  verses: string;
  onePoint: string;
  sections: {
    intro: SermonSectionData;
    me: SermonSectionData;
    we1: SermonSectionData;
    god: SermonSectionData;
    you: SermonSectionData;
    we2: SermonSectionData;
    out: SermonSectionData;
  };
}

export const INITIAL_SECTIONS: SermonState['sections'] = {
  intro: {
    id: 'intro',
    label: 'INTRO',
    title: 'INTRODUCTION',
    subtitle: 'Hook the audience and introduce the topic.',
    placeholder: 'Hook the audience and introduce the topic. Start with a story, a question, or a tension that grabs attention...',
    color: 'cyan',
    content: '',
    isExpanded: true,
  },
  me: {
    id: 'me',
    label: 'ME',
    title: 'ORIENTATION',
    subtitle: 'Here is a problem I have or have had. (Builds Rapport)',
    placeholder: 'Here is a problem I have or have had. (Builds Rapport)',
    color: 'indigo',
    content: '',
    isExpanded: true,
  },
  we1: {
    id: 'we1',
    label: 'WE',
    title: 'IDENTIFICATION',
    subtitle: 'Here is how this affects all of us. (Builds Tension)',
    placeholder: 'Here is how this affects all of us. (Builds Tension)',
    color: 'violet',
    content: '',
    isExpanded: true,
  },
  god: {
    id: 'god',
    label: 'GOD',
    title: 'ILLUMINATION',
    subtitle: 'Here is what God says about it. (Resolves Tension)',
    placeholder: 'Here is what God says about it. (Resolves Tension)',
    color: 'amber',
    content: '',
    isExpanded: true,
  },
  you: {
    id: 'you',
    label: 'YOU',
    title: 'APPLICATION',
    subtitle: 'Here is what you should do. (Challenge)',
    placeholder: 'Here is what you should do. (Challenge)"',
    color: 'orange',
    content: '',
    isExpanded: true,
  },
  we2: {
    id: 'we2',
    label: 'WE',
    title: 'INSPIRATION',
    subtitle: 'Here is what happens if we all do this. (Vision)',
    placeholder: 'Here is what happens if we all do this. (Vision)',
    color: 'emerald',
    content: '',
    isExpanded: true,
  },
  out: {
    id: 'out',
    label: 'OUT',
    title: 'CONCLUSION',
    subtitle: 'Summarize the main point and land the plane.',
    placeholder: 'Summarize the main point and land the plane.',
    color: 'rose',
    content: '',
    isExpanded: true,
  },
};