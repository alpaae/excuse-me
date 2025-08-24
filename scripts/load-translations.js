const { createClient } = require('@supabase/supabase-js');

// Переводы для разных языков
const translations = {
  ru: {
    common: {
      'welcome': 'Добро пожаловать',
      'generate_excuse': 'Создать отмазку',
      'scenario': 'Сценарий',
      'tone': 'Тон',
      'channel': 'Канал',
      'language': 'Язык',
      'context': 'Дополнительный контекст',
      'submit': 'Сгенерировать отмазку',
      'generating': 'Генерация...',
      'result': 'Результат',
      'copy': 'Копировать',
      'share': 'Поделиться',
      'listen': 'Слушать',
      'history': 'История',
      'account': 'Аккаунт',
      'login': 'Войти в аккаунт',
      'logout': 'Выйти',
      'professional': 'Профессиональный',
      'friendly': 'Дружелюбный',
      'formal': 'Формальный',
      'casual': 'Неформальный',
      'email': 'Email',
      'message': 'Сообщение',
      'call': 'Звонок',
      'in_person': 'Лично',
    }
  },
  en: {
    common: {
      'welcome': 'Welcome',
      'generate_excuse': 'Generate Excuse',
      'scenario': 'Scenario',
      'tone': 'Tone',
      'channel': 'Channel',
      'language': 'Language',
      'context': 'Additional Context',
      'submit': 'Generate Excuse',
      'generating': 'Generating...',
      'result': 'Result',
      'copy': 'Copy',
      'share': 'Share',
      'listen': 'Listen',
      'history': 'History',
      'account': 'Account',
      'login': 'Sign In',
      'logout': 'Sign Out',
      'professional': 'Professional',
      'friendly': 'Friendly',
      'formal': 'Formal',
      'casual': 'Casual',
      'email': 'Email',
      'message': 'Message',
      'call': 'Call',
      'in_person': 'In Person',
    }
  },
  pl: {
    common: {
      'welcome': 'Witamy',
      'generate_excuse': 'Wygeneruj wymówkę',
      'scenario': 'Scenariusz',
      'tone': 'Ton',
      'channel': 'Kanał',
      'language': 'Język',
      'context': 'Dodatkowy kontekst',
      'submit': 'Wygeneruj wymówkę',
      'generating': 'Generowanie...',
      'result': 'Wynik',
      'copy': 'Kopiuj',
      'share': 'Udostępnij',
      'listen': 'Słuchaj',
      'history': 'Historia',
      'account': 'Konto',
      'login': 'Zaloguj się',
      'logout': 'Wyloguj się',
      'professional': 'Profesjonalny',
      'friendly': 'Przyjazny',
      'formal': 'Formalny',
      'casual': 'Nieformalny',
      'email': 'Email',
      'message': 'Wiadomość',
      'call': 'Telefon',
      'in_person': 'Osobiście',
    }
  }
};

async function loadTranslations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Loading translations to Supabase...');

  for (const [locale, namespaces] of Object.entries(translations)) {
    for (const [namespace, keys] of Object.entries(namespaces)) {
      for (const [key, value] of Object.entries(keys)) {
        try {
          const { error } = await supabase
            .from('i18n_cache')
            .upsert({
              locale,
              namespace,
              key,
              value,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'locale,namespace,key'
            });

          if (error) {
            console.error(`Error loading ${locale}/${namespace}/${key}:`, error);
          } else {
            console.log(`✓ Loaded ${locale}/${namespace}/${key}`);
          }
        } catch (error) {
          console.error(`Error loading ${locale}/${namespace}/${key}:`, error);
        }
      }
    }
  }

  console.log('Translation loading completed!');
}

loadTranslations().catch(console.error);
