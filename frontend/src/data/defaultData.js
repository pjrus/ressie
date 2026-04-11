export const uid = () => Math.random().toString(36).slice(2, 9);

export const defaultSettings = {
  template:      'jakes',    // 'jakes' | 'awesomecv' | 'deedy'
  fontSize:      '',
  marginTop:     '',
  marginBottom:  '',
  marginLeft:    '',
  marginRight:   '',
  deedyColumnRatio: '',
  deedySectionSpacing: '',
};

export const defaultResumeData = {
  header: {
    name: '',
    phone: '',
    email: '',
    linkedin: '',
    website: '',
  },
  sections: [],
};
