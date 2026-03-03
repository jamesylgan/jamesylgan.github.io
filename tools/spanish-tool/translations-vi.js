// Vietnamese translations for Spanish learning tool
// Contains UI translations, lesson content, and vocabulary

const translationsVI = {
  // UI translations (interface strings)
  ui: {
    // Header
    pageTitle: 'Lộ Trình Tiếng Tây Ban Nha Giao Tiếp',
    pageSubtitle: 'A1 đến B1 trong 45 Ngày',
    percentComplete: '% Hoàn thành',

    // Tabs
    tabLessons: 'Bài học',
    tabQuiz: 'Kiểm tra',
    tabProgress: 'Tiến độ',

    // Quiz Panel
    vocabQuizTitle: 'Kiểm tra Từ vựng (kiểu Anki)',
    vocabQuizDesc: 'Kiểm tra kiến thức từ vựng của bạn. Câu trả lời sai sẽ được lặp lại cho đến khi bạn trả lời đúng.',
    conjQuizTitle: 'Kiểm tra Chia động từ (kiểu Anki)',
    conjQuizDesc: 'Thực hành chia động từ dựa trên tiến độ bài học. Câu trả lời sai sẽ được lặp lại cho đến khi thành thạo.',
    words: 'Từ',
    allWords: 'Tất cả từ',
    questions: 'Câu hỏi',
    allAvailable: 'Tất cả có sẵn',
    remaining: 'còn lại',
    accuracy: 'độ chính xác',
    correct: 'Đúng rồi!',
    theAnswerIs: 'Đáp án là:',
    tryAgain: 'Thử lại',
    correctOutOf: 'đúng trong',
    attempts: 'lần thử',
    uniqueWords: 'từ duy nhất đã học',
    uniqueConjugations: 'cách chia duy nhất đã học',
    conjugateFor: 'Chia động từ',
    forPronoun: 'cho',
    typeAnswer: 'Nhập câu trả lời...',
    check: 'Kiểm tra',
    whatDoesMean: 'Nghĩa của',
    mean: 'là gì?',
    selectConjType: 'Vui lòng chọn ít nhất một loại chia động từ!',
    notEnoughVerbs: 'Không đủ động từ. Hãy hoàn thành thêm bài học!',
    completeToUnlock: 'Hoàn thành thêm bài học để mở khóa các loại chia động từ khác',

    // Progress Panel
    yourProgress: 'Tiến độ của bạn',
    daysCompleted: 'Ngày hoàn thành',
    a1Progress: 'Tiến độ A1',
    a2Progress: 'Tiến độ A2',
    b1Progress: 'Tiến độ B1',
    sectionsChecked: 'Phần đã đánh dấu',
    quizAverage: 'Điểm trung bình',
    quizzes: 'bài kiểm tra',
    downloadProgress: 'Tải xuống tiến độ',
    loadProgress: 'Tải lên tiến độ',
    resetAll: 'Đặt lại tất cả',
    autoSaving: 'Tự động lưu đang bật',
    lastSaved: 'Lưu lần cuối:',
    progressLoaded: 'Đã tải tiến độ thành công!',
    resetConfirm: 'Bạn có chắc muốn đặt lại tất cả tiến độ? Hành động này không thể hoàn tác.',

    // Settings
    settings: 'Cài đặt',
    uiLanguage: 'Ngôn ngữ giao diện',
    moveCompletedToBottom: 'Chuyển bài học đã hoàn thành xuống cuối',
    showLanguageFlags: 'Hiển thị cờ ngôn ngữ ở đầu trang',
    defaultTab: 'Tab mặc định',
    madeForMobile: 'Tối ưu cho điện thoại',
    compactHeader: 'Đầu trang gọn (chỉ hiện thanh tiến độ)',
    completedLessons: 'Bài học đã hoàn thành',

    // Lesson View
    previous: '← Trước',
    backToDays: 'Quay lại danh sách',
    next: 'Tiếp →',
    markComplete: 'Đánh dấu hoàn thành',
    keyPhrases: 'Cụm từ chính',
    grammarBite: 'Ngữ pháp cơ bản',
    speakFirstWords: 'Từ vựng nói đầu tiên',
    miniDialogue: 'Hội thoại ngắn',
    twoMinPractice: 'Thực hành 2 phút',

    // Day card
    day: 'Ngày',
    days: 'ngày',

    // Conjugation types
    conjPresent: 'Hiện tại',
    conjPreterite: 'Quá khứ đơn',
    conjImperfect: 'Quá khứ tiếp diễn',
    conjFuture: 'Tương lai',
    conjConditional: 'Điều kiện',
    conjSubjunctive: 'Giả định',
  },

  // Lesson content translations (Days 1-45)
  lessons: {
    1: {
      title: "Bảng chữ cái, chào hỏi, số 0-20",
      phrases: [
        "Hola. — Chào/ Xin chào.",
        "Adiós. — Tạm biệt.",
        "Por favor. — Làm ơn.",
        "Gracias. — Cảm ơn."
      ],
      grammar: [
        "Tiếng Tây Ban Nha đọc khá \"đúng chữ\": hãy học âm nguyên âm (a, e, i, o, u) thật chắc.",
        "Dấu nhấn (á, é, í, ó, ú) cho biết trọng âm hoặc phân biệt từ.",
        "Bắt đầu đọc to: từng chữ cái, rồi đến âm tiết."
      ],
      dialogueNote: "Chào hỏi + tên: \"Chào. Bạn tên gì? … Rất vui được gặp bạn.\"",
      practice: [
        "Đánh vần tên bạn thành tiếng bằng tiếng Tây Ban Nha.",
        "Đếm 0-20 xuôi và ngược.",
        "Nói 5 câu chào ngắn với Hola/Adiós/Por favor/Gracias."
      ]
    },
    2: {
      title: "Phát âm & trọng âm (nguyên âm, r rung, ñ)",
      phrases: [
        "¿Cómo estás? — Bạn khỏe không?",
        "Estoy bien. — Tôi ổn.",
        "Estoy mal. — Tôi không ổn.",
        "¿Y tú? — Còn bạn?"
      ],
      grammar: [
        "Nguyên âm rất ổn định: a (a), e (e), i (i), o (ô), u (u).",
        "Trọng âm: kết thúc bằng nguyên âm/n/s -> nhấn âm tiết áp chót; còn lại -> nhấn âm tiết cuối.",
        "r: một r đọc nhẹ (pero); rr rung mạnh (perro). ñ giống \"nh\" (año)."
      ],
      dialogueNote: "Hỏi thăm sức khỏe/cảm giác; trả lời bằng trạng thái.",
      practice: [
        "Đọc các câu mẫu chậm, nhấn rõ nguyên âm.",
        "Vỗ tay theo trọng âm: ma-ÑA-na, A-yer, gra-CIAS.",
        "Tự thu âm: ¿Cómo estás? Estoy bien. Estoy cansado."
      ]
    },
    3: {
      title: "Đại từ + SER (hiện tại) để nói \"là\"",
      phrases: [
        "Soy estudiante. — Tôi là sinh viên.",
        "Soy de España. — Tôi đến từ Tây Ban Nha.",
        "¿Eres de aquí? — Bạn là người ở đây à?",
        "Mucho gusto. — Rất vui được gặp bạn."
      ],
      grammar: [
        "Đại từ (yo, tú, él/ella, nosotros...) thường có thể lược bỏ trong tiếng Tây Ban Nha.",
        "SER dùng cho danh tính, nguồn gốc, nghề nghiệp, đặc điểm \"bản chất\".",
        "Dạng nhanh: yo soy, tú eres, él/ella es, nosotros somos, ellos son."
      ],
      dialogueNote: "Giới thiệu bản thân: tên + đến từ đâu.",
      practice: [
        "Nói 5 câu với SER: I am…, you are…, we are…",
        "Hỏi/đáp: ¿De dónde eres? Soy de …",
        "Viết phần tự giới thiệu 3 dòng và đọc thành tiếng."
      ]
    },
    4: {
      title: "ESTAR (hiện tại) cho vị trí & trạng thái",
      phrases: [
        "Estoy en casa. — Tôi ở nhà.",
        "Estoy en Madrid. — Tôi ở Madrid.",
        "Estoy cansado/a. — Tôi mệt.",
        "¿Dónde estás? — Bạn ở đâu?"
      ],
      grammar: [
        "ESTAR dùng cho trạng thái tạm thời, cảm xúc, và vị trí.",
        "Dạng nhanh: estoy, estás, está, estamos, están.",
        "Nói vị trí: estar + en + nơi chốn (Estoy en el hotel)."
      ],
      dialogueNote: "Hỏi vị trí + hỏi thăm tình trạng.",
      practice: [
        "Nói 6 câu về cảm giác: Estoy bien/mal/cansado/a/enfermo/a.",
        "Hỏi 3 câu: ¿Dónde estás? ¿Estás bien? ¿Estás en casa?",
        "Thu âm 30 giây nói bạn đang ở đâu ngay lúc này."
      ]
    },
    5: {
      title: "Hiện tại: động từ đều -AR (hablar, trabajar, estudiar)",
      phrases: [
        "Hablo español. — Tôi nói tiếng Tây Ban Nha.",
        "Trabajo hoy. — Hôm nay tôi làm việc.",
        "Estudio en casa. — Tôi học ở nhà.",
        "¿Hablas inglés? — Bạn nói tiếng Anh không?"
      ],
      grammar: [
        "Hiện tại đều: bỏ -ar rồi thêm đuôi: -o, -as, -a, -amos, -áis, -an.",
        "Câu hỏi thường lên giọng cuối câu: ¿Hablas español?",
        "Có thể bỏ đại từ: (Yo) hablo, (Tú) trabajas."
      ],
      dialogueNote: "Nói bạn làm gì và tần suất (một chút, mỗi ngày).",
      practice: [
        "Chia HABLAR thành tiếng: hablo, hablas, habla, hablamos, hablan.",
        "Tạo 5 câu với động từ -AR (estudio…, trabajo…).",
        "Hỏi 3 người (thật hoặc tưởng tượng): ¿Hablas…? ¿Trabajas…?"
      ]
    },
    6: {
      title: "Hiện tại: động từ đều -ER/-IR (comer, vivir)",
      phrases: [
        "Como aquí. — Tôi ăn ở đây.",
        "Vivo en Barcelona. — Tôi sống ở Barcelona.",
        "¿Comes carne? — Bạn ăn thịt không?",
        "No como carne. — Tôi không ăn thịt."
      ],
      grammar: [
        "Đuôi -ER: -o, -es, -e, -emos, -éis, -en.",
        "Đuôi -IR: -o, -es, -e, -imos, -ís, -en.",
        "Phủ định: đặt no trước động từ: No como, No vivo."
      ],
      dialogueNote: "Câu hỏi có/không + phủ định.",
      practice: [
        "Chia COMER và VIVIR (yo/tú/él/nosotros/ellos).",
        "Tạo 4 câu phủ định với no.",
        "Hỏi/đáp 5 câu: ¿Comes…? ¿Vives…?"
      ]
    },
    7: {
      title: "Hiện tại: động từ bất quy tắc + đổi gốc",
      phrases: [
        "Tengo tiempo. — Tôi có thời gian.",
        "Voy a casa. — Tôi về nhà.",
        "Quiero café. — Tôi muốn cà phê.",
        "¿Puedes ayudarme? — Bạn có thể giúp tôi không?"
      ],
      grammar: [
        "Nhóm bất quy tắc hay gặp: ser, ir, tener, hacer, venir, poder, querer.",
        "Đổi gốc hiện tại (thường gặp): e->ie (querer->quiero), o->ue (poder->puedo).",
        "Học theo \"cụm\" hoàn chỉnh: quiero, puedo, tengo, voy."
      ],
      dialogueNote: "Nhờ giúp + nói bạn cần gì.",
      practice: [
        "Đọc to: tengo, voy, quiero, puedo (mỗi từ 10 lần).",
        "Tạo 5 câu với các từ này (Tengo…, Voy a…, Quiero…).",
        "Hỏi 3 câu lịch sự với ¿Puedes…? + por favor."
      ]
    },
    8: {
      title: "Câu hỏi: trật tự từ + từ để hỏi",
      phrases: [
        "¿Qué es esto? — Cái này là gì?",
        "¿Dónde está el baño? — Nhà vệ sinh ở đâu?",
        "¿Cuánto cuesta? — Bao nhiêu tiền?",
        "¿Cómo se dice…? — Nói … thế nào?"
      ],
      grammar: [
        "Câu hỏi có/không thường giữ trật tự giống câu khẳng định; ngữ điệu + dấu hỏi quyết định.",
        "Từ để hỏi thường đứng đầu câu: qué, dónde, cuándo, cómo, quién, cuál, cuánto.",
        "Khi viết: dùng dấu ¿…?."
      ],
      dialogueNote: "Hỏi đường một cách lịch sự.",
      practice: [
        "Tạo 6 câu hỏi (mỗi từ: qué/dónde/cuándo/cómo/quién/cuánto).",
        "Luyện ngữ điệu: đọc mỗi câu 2 lần (bình thường vs tò mò).",
        "Học thuộc: ¿Cómo se dice '___' en español?"
      ]
    },
    9: {
      title: "Danh từ, giống & tính từ (un/una, -o/-a)",
      phrases: [
        "Es un café. — Đó là một ly cà phê.",
        "Es una ciudad bonita. — Đó là một thành phố đẹp.",
        "Tengo un problema. — Tôi có một vấn đề.",
        "La cuenta, por favor. — Tính tiền giúp tôi."
      ],
      grammar: [
        "Mạo từ: un/una (một), el/la (cái/đó). Giống là một phần của danh từ.",
        "Tính từ thường hòa hợp: un hotel bonito / una casa bonita.",
        "Số nhiều: -s (kết thúc bằng nguyên âm) / -es (phụ âm): hoteles, ciudades."
      ],
      dialogueNote: "Thanh toán: xin hóa đơn và chọn thẻ/tiền mặt.",
      practice: [
        "Chọn 10 đồ vật xung quanh và thêm el/la (đoán giống).",
        "Miêu tả 5 thứ: es un/una ___ + tính từ.",
        "Đóng vai: gọi món và xin la cuenta."
      ]
    },
    10: {
      title: "Vị trí: hay, estar + en, giới từ cơ bản",
      phrases: [
        "Hay un restaurante aquí. — Ở đây có một nhà hàng.",
        "Está cerca. — Nó ở gần.",
        "Está lejos. — Nó ở xa.",
        "¿Está abierto? — Nó mở cửa không?"
      ],
      grammar: [
        "hay = có/đang có (tồn tại): Hay un baño.",
        "estar + en = vị trí: El baño está en el hotel.",
        "Giới từ hữu ích: en, cerca de, lejos de, delante de, detrás de."
      ],
      dialogueNote: "Hỏi có cái gì không và nó ở đâu.",
      practice: [
        "Nói 5 câu với hay (Hay un/una…).",
        "Miêu tả phòng bạn với 5 giới từ (en, cerca de…).",
        "Hỏi đường: ¿Dónde está…? ¿Está lejos?"
      ]
    },
    11: {
      title: "Thói quen hằng ngày + động từ phản thân + nói giờ",
      phrases: [
        "¿Qué hora es? — Mấy giờ rồi?",
        "Son las dos. — Bây giờ 2 giờ.",
        "Me levanto a las siete. — Tôi dậy lúc 7 giờ.",
        "Me acuesto tarde. — Tôi ngủ muộn."
      ],
      grammar: [
        "Động từ phản thân dùng me/te/se/nos/se: me levanto, te levantas, se levanta…",
        "Giờ giấc: Es la una. Son las dos/tres/cuatro…",
        "\"Lúc\" + giờ: a la una / a las dos."
      ],
      dialogueNote: "Nói lịch sinh hoạt với 'mấy giờ…?'",
      practice: [
        "Nói lịch của bạn 5 dòng (sáng/chiều/tối).",
        "Hỏi/đáp 3 câu với ¿A qué hora…?",
        "Viết 6 câu phản thân và đọc thành tiếng."
      ]
    },
    12: {
      title: "GUSTAR: nói về sở thích",
      phrases: [
        "Me gusta el café. — Tôi thích cà phê.",
        "No me gusta el té. — Tôi không thích trà.",
        "Me encanta la música. — Tôi rất thích âm nhạc.",
        "¿Te gusta viajar? — Bạn thích du lịch không?"
      ],
      grammar: [
        "Với gustar, \"thứ bạn thích\" là chủ ngữ: Me gusta el café (cà phê làm tôi thích).",
        "Dùng đại từ gián tiếp: me, te, le, nos, les + gusta/gustan.",
        "Một thứ -> gusta; nhiều thứ -> gustan."
      ],
      dialogueNote: "Hỏi ai đó thích gì; trả lời và nói thích hơn cái gì.",
      practice: [
        "Tạo 6 câu: Me gusta…, No me gusta…, Me encantan…",
        "Hỏi 5 người: ¿Te gusta…? (đồ ăn, nhạc, phim).",
        "Nói 1 câu so sánh: Prefiero ___ a ___."
      ]
    },
    13: {
      title: "Hiện tại tiếp diễn: estar + V-ing (-ando/-iendo)",
      phrases: [
        "Estoy estudiando. — Tôi đang học.",
        "Estoy trabajando ahora. — Tôi đang làm việc bây giờ.",
        "¿Qué estás haciendo? — Bạn đang làm gì?",
        "Estamos hablando. — Chúng tôi đang nói chuyện."
      ],
      grammar: [
        "Cấu trúc: estar (hiện tại) + gerundio: hablando, comiendo, viviendo.",
        "Dùng cho hành động đang diễn ra hoặc \"gần đây\": Estoy trabajando esta semana.",
        "Nhiều khi chỉ cần hiện tại; tiếp diễn nhấn mạnh \"đang\"."
      ],
      dialogueNote: "Hỏi đang làm gì; hoãn lại lịch sự.",
      practice: [
        "Nói 6 câu với estoy/estás/está + gerundio.",
        "Hỏi 3 câu: ¿Qué estás haciendo? ¿Estás trabajando? ¿Estás estudiando?",
        "Miêu tả khoảnh khắc hiện tại trong 20 giây (Tôi đang…; tôi không…)."
      ]
    },
    14: {
      title: "Đại từ tân ngữ trực tiếp: lo/la/los/las",
      phrases: [
        "Lo quiero. — Tôi muốn nó.",
        "La veo. — Tôi thấy cô ấy / nó (cái).",
        "¿Lo tienes? — Bạn có nó không?",
        "No la entiendo. — Tôi không hiểu nó/cô ấy."
      ],
      grammar: [
        "Tân ngữ trực tiếp = thứ bị tác động: I buy it -> Lo compro.",
        "Đại từ: lo (giống đực), la (giống cái), los/las (số nhiều).",
        "Vị trí: đứng trước động từ chia: Lo tengo. Với nguyên mẫu: Quiero verlo."
      ],
      dialogueNote: "Dùng lo/la để tránh lặp danh từ, nghe tự nhiên hơn.",
      practice: [
        "Thay danh từ bằng đại từ: Tengo el café -> Lo tengo.",
        "Tạo 5 câu dùng lo/la.",
        "Nói 3 câu với nguyên mẫu + đại từ: Quiero verlo / Necesito comprarlo."
      ]
    },
    15: {
      title: "Đại từ gián tiếp: me/te/le/nos/les (cho ai đó)",
      phrases: [
        "Me puedes ayudar. — Bạn có thể giúp tôi.",
        "Le digo la verdad. — Tôi nói sự thật với anh ấy/cô ấy.",
        "¿Me das agua? — Bạn cho tôi nước được không?",
        "Les envío un mensaje. — Tôi gửi họ một tin nhắn."
      ],
      grammar: [
        "Tân ngữ gián tiếp = cho ai đó: I give you a coffee -> Te doy un café.",
        "Đại từ: me, te, le, nos, les (thường kèm a + người để rõ nghĩa).",
        "Trật tự: IO + động từ + DO: Te lo doy (Tôi đưa nó cho bạn)."
      ],
      dialogueNote: "Dùng me/te/le để lời nhờ vả tự nhiên hơn.",
      practice: [
        "Chuyển: Doy el libro a Ana -> Le doy el libro.",
        "Tạo 5 câu với me/te/le.",
        "Nói 3 câu kết hợp: Te lo doy / Me lo dices / Se lo muestro."
      ]
    },
    16: {
      title: "Quá khứ đơn (pretérito): động từ đều -AR",
      phrases: [
        "Ayer hablé con mi amigo. — Hôm qua tôi nói chuyện với bạn.",
        "Trabajé mucho. — Tôi đã làm việc nhiều.",
        "Estudié español. — Tôi đã học tiếng Tây Ban Nha.",
        "¿Qué hiciste ayer? — Hôm qua bạn đã làm gì?"
      ],
      grammar: [
        "Quá khứ đơn dùng cho hành động đã hoàn tất (hôm qua, tuần trước).",
        "Đuôi -AR: -é, -aste, -ó, -amos, -asteis, -aron.",
        "Từ chỉ thời gian giúp rõ: ayer, anoche, la semana pasada, hace…"
      ],
      dialogueNote: "Hỏi hôm qua làm gì; trả lời bằng 2 hành động quá khứ.",
      practice: [
        "Chia HABLAR ở quá khứ đơn (yo/tú/él/nos/ellos).",
        "Nói 5 câu về hôm qua với ayer/anoche.",
        "Hỏi 3 câu với ¿Qué hiciste…?"
      ]
    },
    17: {
      title: "Quá khứ đơn: động từ đều -ER/-IR",
      phrases: [
        "Comí en un restaurante. — Tôi đã ăn ở nhà hàng.",
        "Viví en Madrid. — Tôi đã sống ở Madrid.",
        "Bebí café. — Tôi đã uống cà phê.",
        "¿Dónde comiste? — Bạn đã ăn ở đâu?"
      ],
      grammar: [
        "Đuôi -ER/-IR: -í, -iste, -ió, -imos, -isteis, -ieron.",
        "Dùng cho sự kiện đã kết thúc: ayer comí…, el año pasado viví…",
        "Mẫu kể lại: Primero…, luego…, finalmente…"
      ],
      dialogueNote: "Dùng động từ quá khứ để kể theo trình tự.",
      practice: [
        "Chia COMER và VIVIR ở quá khứ (yo/tú/él/nos/ellos).",
        "Kể bữa ăn gần nhất 4 câu (Primero…, luego…).",
        "Hỏi/đáp: ¿Dónde bebiste café?"
      ]
    },
    18: {
      title: "Quá khứ đơn: động từ bất quy tắc (fui, tuve, hice...)",
      phrases: [
        "Fui al restaurante. — Tôi đã đi đến nhà hàng.",
        "Tuve un problema. — Tôi đã có một vấn đề.",
        "Hice una reserva. — Tôi đã đặt chỗ.",
        "Dije la verdad. — Tôi đã nói sự thật."
      ],
      grammar: [
        "Nhiều động từ hay dùng là bất quy tắc ở quá khứ: ser/ir, tener, estar, hacer, decir, poder, poner, venir, traer.",
        "Tin vui: đa số bất quy tắc dùng chung đuôi: -e, -iste, -o, -imos, -isteis, -ieron.",
        "Học theo \"gốc\": tuv-, estuv-, hic-, dij-, pud-, pus-, vin-, traj-."
      ],
      dialogueNote: "Dùng quá khứ bất quy tắc để kể tình huống và cách giải quyết.",
      practice: [
        "Đọc các dạng chính: fui, tuve, estuve, hice, dije, pude, puse, vine, traje.",
        "Tạo 5 câu về hôm qua, mỗi câu 1 động từ bất quy tắc.",
        "Hỏi: ¿Fuiste…? ¿Tuviste…? ¿Pudiste…?"
      ]
    },
    19: {
      title: "Quá khứ chưa hoàn thành: miêu tả & thói quen (era, iba, tenía)",
      phrases: [
        "Cuando era niño/a… — Khi tôi còn nhỏ…",
        "Siempre iba a la escuela. — Tôi luôn đi học.",
        "Hacía buen tiempo. — Thời tiết lúc đó đẹp.",
        "Tenía 10 años. — Tôi 10 tuổi."
      ],
      grammar: [
        "Imperfect dùng để kể bối cảnh, thói quen, hành động lặp lại, miêu tả trong quá khứ.",
        "Đuôi đều: -aba (AR) và -ía (ER/IR).",
        "3 bất quy tắc quan trọng: ser -> era, ir -> iba, ver -> veía."
      ],
      dialogueNote: "Miêu tả \"ngày xưa\" (era…).",
      practice: [
        "Tạo 5 câu bắt đầu bằng Cuando era…",
        "Miêu tả quê bạn bằng 4 tính từ ở imperfect (Era…, había…).",
        "So sánh: Ayer fui… vs Antes iba… (một lần vs thói quen)."
      ]
    },
    20: {
      title: "Kể chuyện: quá khứ đơn vs imperfect + từ nối",
      phrases: [
        "Primero fuimos al centro. — Đầu tiên chúng tôi đi vào trung tâm.",
        "Luego comimos. — Sau đó chúng tôi ăn.",
        "De repente, llovió. — Đột nhiên trời mưa.",
        "Mientras caminábamos, hablamos. — Trong khi đi bộ, chúng tôi nói chuyện."
      ],
      grammar: [
        "Imperfect = bối cảnh/đang diễn ra: hacía frío, caminábamos…",
        "Quá khứ đơn = sự kiện hoàn tất: llegamos, comimos, llovió…",
        "Dùng từ nối để nói trôi chảy: primero, luego, después, mientras, de repente."
      ],
      dialogueNote: "Trả lời 'Ngày của bạn thế nào?' theo trình tự rõ ràng.",
      practice: [
        "Kể chuyện 1 phút dùng ít nhất 5 từ nối.",
        "Viết 6 dòng: 3 câu imperfect (bối cảnh) + 3 câu quá khứ đơn (sự kiện).",
        "Kể lại hôm qua lần nữa, chậm hơn và chi tiết hơn."
      ]
    },
    21: {
      title: "So sánh: más/menos, tan...como, el/la más...",
      phrases: [
        "Este hotel es más barato. — Khách sạn này rẻ hơn.",
        "Es menos caro que el otro. — Nó ít đắt hơn cái kia.",
        "Es tan bonito como... — Nó đẹp như...",
        "Es el mejor lugar. — Đây là nơi tốt nhất."
      ],
      grammar: [
        "más/menos + tính từ + que: más grande que..., menos interesante que...",
        "tan + tính từ + como: tan fácil como...",
        "So sánh nhất: el/la más + tính từ; bất quy tắc: mejor/peor."
      ],
      dialogueNote: "So sánh 2 lựa chọn để quyết định.",
      practice: [
        "Tạo 6 câu so sánh về đồ vật xung quanh (más/menos/tan...).",
        "Nói 3 câu nhất: el mejor..., la más..., los peores...",
        "Chọn giữa 2 nơi (A vs B) và giải thích lý do."
      ]
    },
    22: {
      title: "Tương lai: ir a + nguyên mẫu + tương lai đơn (-é, -ás, -á...)",
      phrases: [
        "Voy a estudiar hoy. — Hôm nay tôi sẽ học.",
        "Mañana voy a viajar. — Ngày mai tôi sẽ đi du lịch.",
        "Haré una reserva. — Tôi sẽ đặt chỗ.",
        "¿Vendrás conmigo? — Bạn sẽ đi cùng tôi chứ?"
      ],
      grammar: [
        "Tương lai gần: ir (hiện tại) + a + nguyên mẫu: voy a comer, vamos a salir.",
        "Tương lai đơn: thêm đuôi vào nguyên mẫu: hablaré, comerás, vivirá...",
        "Một số có gốc bất quy tắc: hacer->har-, tener->tendr-, venir->vendr-."
      ],
      dialogueNote: "Nói kế hoạch với 'voy a...'",
      practice: [
        "Nói 8 kế hoạch tương lai với voy a... (hôm nay/ngày mai/tuần này).",
        "Chia tương lai của hablar/comer/vivir (yo/tú/él).",
        "Hỏi: ¿Qué vas a hacer...? và trả lời 2 câu."
      ]
    },
    23: {
      title: "Hiện tại hoàn thành: he/has/ha + phân từ (he comido)",
      phrases: [
        "He comido aquí. — Tôi đã ăn ở đây.",
        "He estado en España. — Tôi đã từng ở Tây Ban Nha.",
        "¿Has viajado a México? — Bạn đã đi Mexico bao giờ chưa?",
        "Nunca he probado eso. — Tôi chưa bao giờ thử cái đó."
      ],
      grammar: [
        "Cấu trúc: haber (he, has, ha, hemos, han) + phân từ (comido, vivido).",
        "Thường dùng cho trải nghiệm và 'quá khứ gần' (đặc biệt ở Tây Ban Nha).",
        "Từ khóa: ya (rồi), todavía/aún (vẫn/chưa), nunca (chưa bao giờ), alguna vez (đã từng)."
      ],
      dialogueNote: "Nói về trải nghiệm và món bạn đã thử.",
      practice: [
        "Tạo 6 câu 'đã...': He comido..., He visto..., He estado...",
        "Hỏi 5 câu 'đã từng chưa': ¿Has... alguna vez?",
        "Trả lời: Nunca he... / Sí, he... / Todavía no he..."
      ]
    },
    24: {
      title: "Por vs para (quy tắc nhanh để nói)",
      phrases: [
        "Es para ti. — Cái này dành cho bạn.",
        "Gracias por tu ayuda. — Cảm ơn vì sự giúp đỡ của bạn.",
        "Voy por la calle. — Tôi đi dọc theo đường.",
        "Lo hago para aprender. — Tôi làm điều đó để học."
      ],
      grammar: [
        "para = mục đích/đích đến/người nhận/hạn: para ti, para aprender, para mañana.",
        "por = lý do/nguyên nhân/trao đổi/di chuyển: por eso, por la calle, por 10 euros.",
        "Cụm hay gặp: gracias por... (cảm ơn vì...)."
      ],
      dialogueNote: "Cảm ơn ai đó và nói lý do/mục đích bạn làm.",
      practice: [
        "Tạo 6 câu: 3 câu para + nguyên mẫu, 3 câu por + lý do.",
        "Nói 3 mức giá: Es por 5 euros / por 10 euros...",
        "Dùng thật trong ngày: gracias por..."
      ]
    },
    25: {
      title: "Ser vs estar (so sánh hay gặp khi nói)",
      phrases: [
        "Es aburrido. — Nó nhàm chán.",
        "Estoy aburrido/a. — Tôi chán.",
        "Es listo. — Anh ấy/cô ấy thông minh.",
        "Estoy listo/a. — Tôi sẵn sàng."
      ],
      grammar: [
        "SER = bản chất/đặc điểm: Es aburrido (nhàm chán), Es rico (ngon/giàu).",
        "ESTAR = trạng thái/cảm xúc: Estoy aburrido (tôi chán), Estoy listo (tôi sẵn sàng).",
        "Một số tính từ đổi nghĩa theo ser/estar: listo, aburrido, rico..."
      ],
      dialogueNote: "Dùng estar cho cảm xúc và \"sẵn sàng\".",
      practice: [
        "Tạo 6 cặp: Es ___ / Estoy ___ (aburrido, listo, feliz, cansado).",
        "Miêu tả 2 người bằng ser và 2 cảm xúc bằng estar.",
        "Nói 5 câu về trạng thái hôm nay: Hoy estoy..."
      ]
    },
    26: {
      title: "Mệnh lệnh: tú/usted cơ bản",
      phrases: [
        "Habla más despacio. — Nói chậm hơn.",
        "No hables inglés. — Đừng nói tiếng Anh.",
        "Dime tu nombre. — Nói cho tôi tên bạn.",
        "Venga, por favor. — Xin mời đến (lịch sự)."
      ],
      grammar: [
        "Mệnh lệnh khẳng định tú: giống ngôi 3 hiện tại (habla, come, vive).",
        "Mệnh lệnh phủ định tú: no + subjuntivo (no hables, no comas).",
        "Một số bất quy tắc tú: di, haz, ve, pon, sal, sé, ten, ven."
      ],
      dialogueNote: "Dùng mệnh lệnh lịch sự để điều chỉnh tốc độ nói chuyện.",
      practice: [
        "Nói 6 câu mệnh lệnh: habla, come, vive / no hables, no comas, no vivas.",
        "Học 4 bất quy tắc: di, haz, ve, pon.",
        "Dùng trong ngày: 'Habla más despacio, por favor.'"
      ]
    },
    27: {
      title: "Đại từ với mệnh lệnh: dímelo / no me lo digas",
      phrases: [
        "Dímelo. — Nói cho tôi đi.",
        "No me lo digas. — Đừng nói cho tôi.",
        "Tráemelo. — Mang nó cho tôi.",
        "Ayúdame, por favor. — Giúp tôi với."
      ],
      grammar: [
        "Mệnh lệnh khẳng định: gắn đại từ vào sau: dime + lo -> dímelo.",
        "Mệnh lệnh phủ định: đại từ đứng trước: No me lo digas.",
        "Hai đại từ: (me/te/le/nos/les) + (lo/la/los/las). le/les -> se (Se lo doy)."
      ],
      dialogueNote: "Nhờ ai đó nhắc lại thông tin và dùng đại từ tự nhiên.",
      practice: [
        "Ghép: di + me + lo -> dímelo (luyện 5 ví dụ).",
        "Tạo 4 câu phủ định: No me lo digas / No se lo des...",
        "Luyện với thông tin thật: số điện thoại, địa chỉ, tên."
      ]
    },
    28: {
      title: "Điều kiện (conditional): lời nhờ lịch sự (me gustaría, podrías...)",
      phrases: [
        "Me gustaría un café. — Tôi muốn một ly cà phê.",
        "¿Podrías ayudarme? — Bạn có thể giúp tôi được không?",
        "Querría pagar. — Tôi muốn thanh toán.",
        "¿Sería posible? — Có thể được không?"
      ],
      grammar: [
        "Đuôi conditional gắn vào nguyên mẫu: -ía, -ías, -ía, -íamos, -íais, -ían.",
        "Dùng để nhờ vả lịch sự và giả định: Me gustaría..., Podrías...",
        "Nó dùng chung gốc bất quy tắc với tương lai: tendr-, podr-, har-, dir-, vendr-..."
      ],
      dialogueNote: "Đoạn hội thoại lịch sự khi thanh toán ở nhà hàng.",
      practice: [
        "Chuyển 5 câu yêu cầu trực tiếp sang lịch sự: Quiero -> Me gustaría / Quisiera.",
        "Hỏi 5 câu lịch sự: ¿Podrías...? ¿Sería posible...?",
        "Đóng vai gọi món: Me gustaría... / Querría..."
      ]
    },
    29: {
      title: "Nghĩa vụ & lời khuyên: tener que, hay que, deber",
      phrases: [
        "Tengo que trabajar. — Tôi phải làm việc.",
        "Hay que estudiar. — Phải học thôi.",
        "Deberías descansar. — Bạn nên nghỉ ngơi.",
        "No debes hacer eso. — Bạn không nên làm vậy."
      ],
      grammar: [
        "tener que + nguyên mẫu = bắt buộc cá nhân: Tengo que ir.",
        "hay que + nguyên mẫu = quy tắc/chung: Hay que practicar.",
        "deber = nên/phải (lời khuyên hoặc nghĩa vụ): Debes/Deberías..."
      ],
      dialogueNote: "Cho lời khuyên học tiếng Tây Ban Nha (rất hữu ích!).",
      practice: [
        "Tạo 6 câu: 2 câu tengo que, 2 câu hay que, 2 câu deberías.",
        "Cho bạn lời khuyên: Deberías... / No debes...",
        "Nói 30 giây: tuần này bạn phải làm gì."
      ]
    },
    30: {
      title: "Ngày luyện nói: nhà hàng + hỏi đường + nói chuyện xã giao",
      phrases: [
        "Quisiera pedir, por favor. — Tôi muốn gọi món, làm ơn.",
        "¿Qué me recomienda? — Bạn gợi ý món gì?",
        "Perdón, ¿dónde queda...? — Xin lỗi, ... ở đâu?",
        "¿Puede repetir? — Bạn có thể nói lại không?"
      ],
      grammar: [
        "Hôm nay tập trôi chảy: dùng những gì bạn đã học (hiện tại, quá khứ, tương lai, lịch sự).",
        "Dùng từ đệm để có thời gian: pues..., entonces..., o sea..., a ver...",
        "Khi bí: hỏi lại: ¿Cómo se dice...? ¿Qué significa...?"
      ],
      dialogueNote: "Hội thoại thực tế: hỏi đường + kết thúc lịch sự.",
      practice: [
        "Đóng vai 2 phút: gọi món + trả tiền + chào tạm biệt.",
        "Đóng vai 2 phút: hỏi đường + xác nhận + cảm ơn.",
        "Thu âm 1 phút 'về tôi' dùng ít nhất 3 từ nối."
      ]
    },
    31: {
      title: "Sắc thái quá khứ: preterite vs imperfect (nâng cấp kể chuyện)",
      phrases: [
        "Cuando llegué, estaba lloviendo. — Khi tôi đến, trời đang mưa.",
        "De niño, solía ir al parque. — Hồi nhỏ, tôi hay đi công viên.",
        "Ese día conocí a mi mejor amigo. — Ngày đó tôi gặp người bạn thân nhất.",
        "Antes pensaba eso, pero ahora no. — Trước đây tôi nghĩ vậy, nhưng giờ thì không."
      ],
      grammar: [
        "Dùng imperfect cho bối cảnh/thói quen 'ngày xưa': era, tenía, solía...",
        "Dùng preterite cho sự kiện chính: llegué, conocí, decidí...",
        "Kết hợp: bối cảnh (imperfect) + sự kiện (preterite) = kể chuyện tự nhiên."
      ],
      dialogueNote: "Nói về thói quen 'ngày xưa' (solía...).",
      practice: [
        "Kể 1 phút về tuổi thơ dùng 3 động từ imperfect + 3 động từ preterite.",
        "Dùng solía trong 5 câu (tôi từng/hay...).",
        "Viết câu chuyện ngắn: Khi tôi đến..., thì..."
      ]
    },
    32: {
      title: "Mệnh đề quan hệ: que, quien, donde, lo que",
      phrases: [
        "La persona que conocí... — Người mà tôi gặp...",
        "El lugar donde vivo... — Nơi tôi sống...",
        "Lo que quiero es practicar. — Điều tôi muốn là luyện tập.",
        "Es algo que me gusta. — Đó là thứ tôi thích."
      ],
      grammar: [
        "que là đại từ quan hệ phổ biến nhất: el libro que tengo...",
        "donde = nơi mà: la ciudad donde nací...",
        "lo que = điều mà: Lo que necesito es tiempo."
      ],
      dialogueNote: "Dùng mệnh đề quan hệ để \"nâng trình B1\" ngay.",
      practice: [
        "Tạo 6 câu: 2 câu với que, 2 câu với donde, 2 câu với lo que.",
        "Miêu tả một người bạn biết dùng que (một người mà...).",
        "Nói ý kiến 3 dòng dùng lo que..."
      ]
    },
    33: {
      title: "Subjuntivo hiện tại: cách chia + 'tôi muốn rằng...'",
      phrases: [
        "Quiero que vengas. — Tôi muốn bạn đến.",
        "Es importante que practiques. — Quan trọng là bạn luyện tập.",
        "Espero que estés bien. — Tôi hy vọng bạn ổn.",
        "Ojalá tenga tiempo. — Hy vọng tôi có thời gian."
      ],
      grammar: [
        "Subjuntivo dùng sau các 'tín hiệu': querer que, esperar que, es importante que...",
        "Cách chia (hiện tại): lấy dạng 'yo' hiện tại, bỏ -o, thêm đuôi \"đối\" (hablar->hable, comer->coma).",
        "Bất quy tắc quan trọng: ser->sea, ir->vaya, estar->esté, tener->tenga, hacer->haga."
      ],
      dialogueNote: "Dùng subjuntivo sau 'muốn/hy vọng'.",
      practice: [
        "Tạo 6 câu với quiero que / espero que + subjuntivo.",
        "Chia subjuntivo: hablar, comer, vivir (yo/tú/él).",
        "Học 3 bất quy tắc: sea, vaya, tenga."
      ]
    },
    34: {
      title: "Subjuntivo với cảm xúc: me alegra que..., me molesta que...",
      phrases: [
        "Me alegra que estés aquí. — Tôi mừng vì bạn ở đây.",
        "Me molesta que llegues tarde. — Tôi khó chịu vì bạn đến muộn.",
        "Es una pena que no puedas venir. — Thật tiếc bạn không thể đến.",
        "Me preocupa que sea difícil. — Tôi lo rằng nó khó."
      ],
      grammar: [
        "Cảm xúc/thái độ + que -> subjuntivo: me alegra que..., me preocupa que...",
        "Nếu không đổi chủ ngữ, thường dùng nguyên mẫu: Me alegra verte.",
        "Dùng để phản ứng tự nhiên khi nghe tin."
      ],
      dialogueNote: "Phản ứng cảm xúc và dùng subjuntivo.",
      practice: [
        "Tạo 6 câu phản ứng: Me alegra que..., Me preocupa que..., Es una pena que...",
        "Chuyển 3 câu nguyên mẫu sang que + subjuntivo (khi đổi chủ ngữ).",
        "Nói 5 phản ứng ngắn trước các 'tin' tưởng tượng."
      ]
    },
    35: {
      title: "Subjuntivo với nghi ngờ/phủ định: no creo que..., dudo que...",
      phrases: [
        "No creo que sea verdad. — Tôi không nghĩ đó là sự thật.",
        "Dudo que llegue a tiempo. — Tôi nghi là sẽ không đến kịp.",
        "¿Crees que es posible? — Bạn nghĩ có thể không?",
        "No pienso que sea necesario. — Tôi không nghĩ là cần thiết."
      ],
      grammar: [
        "Khẳng định (creo que...) thường dùng chỉ định: Creo que es verdad.",
        "Phủ định/nghi ngờ (no creo que..., dudo que...) dùng subjuntivo: No creo que sea...",
        "Câu hỏi có thể linh hoạt: ¿Crees que...? thường dùng chỉ định nếu bạn nghiêng về 'có'; dùng subjuntivo nếu nghi ngờ."
      ],
      dialogueNote: "Diễn đạt sự không chắc chắn một cách lịch sự.",
      practice: [
        "Tạo 6 cặp: Creo que es... / No creo que sea...",
        "Dùng dudo que... trong 3 câu.",
        "Nói 5 câu 'có lẽ' với quizás/tal vez."
      ]
    },
    36: {
      title: "Subjuntivo với mệnh đề thời gian: cuando, hasta que, antes de que",
      phrases: [
        "Cuando llegues, llámame. — Khi bạn đến, gọi cho tôi.",
        "Te espero hasta que termines. — Tôi đợi đến khi bạn xong.",
        "Antes de que salgas, dime. — Trước khi bạn đi, nói tôi biết.",
        "Después de que comamos, vamos. — Sau khi ăn, chúng ta đi."
      ],
      grammar: [
        "Nếu mệnh đề thời gian nói về tương lai, thường dùng subjuntivo: cuando llegues...",
        "Nếu là thói quen/quá khứ, dùng chỉ định: cuando llego... / cuando llegué...",
        "Tín hiệu hay gặp: cuando, hasta que, antes de que, después de que (tương lai)."
      ],
      dialogueNote: "Lên kế hoạch với mệnh đề thời gian, nói tự nhiên.",
      practice: [
        "Tạo 6 kế hoạch tương lai dùng cuando/hasta que + subjuntivo.",
        "Tạo 3 câu thói quen với cuando + hiện tại chỉ định.",
        "Tạo 3 câu nhắc lịch sự: Cuando puedas..., llámame."
      ]
    },
    37: {
      title: "Từ nối cho ý kiến: aunque, sin embargo, además...",
      phrases: [
        "Me parece que es buena idea. — Tôi thấy đó là ý hay.",
        "Aunque es caro, vale la pena. — Dù đắt, nhưng đáng.",
        "Sin embargo, no tengo tiempo. — Tuy nhiên, tôi không có thời gian.",
        "Por lo tanto, voy mañana. — Do đó, tôi sẽ đi ngày mai."
      ],
      grammar: [
        "Dùng từ nối để tạo câu dài hơn (kỹ năng quan trọng ở B1).",
        "aunque + chỉ định = sự thật; aunque + subjuntivo = giả định/chưa chắc (nâng cao, tùy chọn).",
        "Mẫu đơn: Ý kiến + porque + lý do + sin embargo + đối lập."
      ],
      dialogueNote: "Nói ý kiến cân bằng (ưu + nhược).",
      practice: [
        "Nói 5 ý kiến với: Me parece que... / Creo que...",
        "Thêm đối lập bằng aunque hoặc sin embargo cho mỗi câu.",
        "Thu âm 60 giây: ý kiến về thành phố/công việc/học tập."
      ]
    },
    38: {
      title: "Cấu trúc 'se': vô nhân xưng/bị động + 'se' vô ý",
      phrases: [
        "Se habla español aquí. — Ở đây nói tiếng Tây Ban Nha.",
        "Se vende café. — Bán cà phê.",
        "Se me cayó el teléfono. — Tôi lỡ làm rơi điện thoại.",
        "Se nos olvidó la reserva. — Chúng tôi lỡ quên đặt chỗ."
      ],
      grammar: [
        "Se vô nhân xưng: se + động từ (ngôi 3) = 'người ta': Se vive bien aquí.",
        "Se bị động: se + động từ + vật = 'được làm/bán': Se venden entradas.",
        "Se vô ý: se + đại từ gián tiếp + động từ: Se me cayó... (tôi lỡ làm rơi)."
      ],
      dialogueNote: "Hỏi nơi đó nói tiếng gì; dùng se.",
      practice: [
        "Tạo 5 câu se vô nhân xưng: Se come bien..., Se trabaja...",
        "Tạo 3 câu se vô ý: Se me cayó..., Se me olvidó...",
        "Tập đọc 10 biển hiệu tưởng tượng: Se vende..., Se busca..."
      ]
    },
    39: {
      title: "Tường thuật: dijo que..., me preguntó si...",
      phrases: [
        "Me dijo que estaba ocupado. — Anh ấy nói với tôi là anh ấy bận.",
        "Me preguntó si tenía tiempo. — Anh ấy hỏi tôi có thời gian không.",
        "Le conté que fui al médico. — Tôi kể với anh ấy là tôi đã đi bác sĩ.",
        "Según él, es importante. — Theo anh ấy, điều đó quan trọng."
      ],
      grammar: [
        "Tường thuật dùng que (rằng) và si (liệu có): Dijo que... / Preguntó si...",
        "Thì thường lùi về quá khứ khi tường thuật (ý chính): está -> estaba; tiene -> tenía.",
        "Giữ đơn giản: ưu tiên ý nghĩa và rõ ràng."
      ],
      dialogueNote: "Tường thuật lời ai đó nói trong 1 câu.",
      practice: [
        "Viết 5 câu: Me dijo que... (công việc, kế hoạch, cảm xúc).",
        "Hỏi và tường thuật: ¿Qué te preguntó? -> Me preguntó si...",
        "Kể lại một cuộc trò chuyện ngắn hôm nay."
      ]
    },
    40: {
      title: "Câu điều kiện: thật vs giả định (si + hiện tại / si + subj. quá khứ)",
      phrases: [
        "Si tengo tiempo, voy. — Nếu tôi có thời gian, tôi sẽ đi.",
        "Si llueve, no salimos. — Nếu trời mưa, chúng tôi không ra ngoài.",
        "Si tuviera tiempo, viajaría más. — Nếu tôi có thời gian, tôi sẽ đi du lịch nhiều hơn.",
        "¿Qué harías si pudieras? — Bạn sẽ làm gì nếu bạn có thể?"
      ],
      grammar: [
        "Điều kiện thật/có thể: si + hiện tại -> hiện tại/tương lai/mệnh lệnh: Si puedo, voy.",
        "Giả định: si + subjuntivo quá khứ -> conditional: Si pudiera, iría.",
        "Dùng để nói ước mơ, giả định, 'nếu... thì bạn sẽ...?'"
      ],
      dialogueNote: "Câu hỏi kinh điển B1: 'Nếu... thì bạn sẽ làm gì?'",
      practice: [
        "Tạo 5 câu điều kiện thật với si + hiện tại.",
        "Tạo 5 câu giả định với si + subj. quá khứ + conditional.",
        "Hỏi 3 người: ¿Qué harías si...?"
      ]
    },
    41: {
      title: "Subjuntivo quá khứ để lịch sự: quisiera, pudiera, fuera",
      phrases: [
        "Quisiera reservar una mesa. — Tôi muốn đặt bàn (lịch sự).",
        "Si fuera tú, lo haría. — Nếu tôi là bạn, tôi sẽ làm.",
        "¿Pudiera hablar con usted? — Tôi có thể nói chuyện với ngài không?",
        "Ojalá tuviera más tiempo. — Ước gì tôi có nhiều thời gian hơn."
      ],
      grammar: [
        "Subjuntivo quá khứ hay gặp trong giả định (si tuviera...) và lời nhờ rất lịch sự (quisiera...).",
        "Cách chia nhanh: từ quá khứ đơn ngôi 'ellos' (hablaron -> hablara).",
        "Một số bất quy tắc hay gặp: fuera (ser/ir), tuviera (tener), pudiera (poder), hiciera (hacer)."
      ],
      dialogueNote: "Dùng 'quisiera' để nói lịch sự hơn.",
      practice: [
        "Tạo 5 câu nhờ lịch sự với quisiera/pudiera.",
        "Tạo 3 câu 'Nếu tôi là bạn...': Si fuera tú...",
        "Nhận diện các dạng trong đoạn văn: fuera, tuviera, pudiera."
      ]
    },
    42: {
      title: "Hiện tại hoàn thành vs quá khứ đơn (khác biệt dùng & từ khóa)",
      phrases: [
        "Hoy he hablado con mi jefe. — Hôm nay tôi đã nói chuyện với sếp.",
        "Ayer hablé con mi jefe. — Hôm qua tôi đã nói chuyện với sếp.",
        "Este año he viajado mucho. — Năm nay tôi đã đi nhiều.",
        "En 2020 viajé a México. — Năm 2020 tôi đã đi Mexico."
      ],
      grammar: [
        "Cả hai đều có thể dịch là 'đã...' trong tiếng Việt; tiếng Tây Ban Nha chọn tùy khung thời gian và vùng.",
        "Ở Tây Ban Nha, hiện tại hoàn thành hay dùng với 'hôm nay/tuần này/năm nay'. Nhiều vùng Mỹ Latin dùng quá khứ đơn nhiều hơn.",
        "Từ khóa: hoy/esta semana/este año -> thường hiện tại hoàn thành; ayer/el año pasado -> quá khứ đơn."
      ],
      dialogueNote: "Chọn thì theo khung thời gian (hôm nay vs hôm qua).",
      practice: [
        "Tạo 6 cặp: Hoy he... / Ayer ... (cùng động từ).",
        "Kể 3 trải nghiệm 'năm nay' với he...",
        "Chọn mục tiêu: kiểu Tây Ban Nha (dùng perfect nhiều) hay kiểu Mỹ Latin (dùng preterite nhiều)."
      ]
    },
    43: {
      title: "Suy đoán: dùng tương lai/conditional như 'có lẽ' (estará, sería)",
      phrases: [
        "Estará en casa. — Chắc anh ấy ở nhà.",
        "Será tarde. — Chắc muộn rồi.",
        "Sería mejor ir mañana. — Tốt hơn là đi ngày mai.",
        "No estoy seguro. — Tôi không chắc."
      ],
      grammar: [
        "Tiếng Tây Ban Nha dùng tương lai để suy đoán hiện tại: Será verdad = Chắc là đúng.",
        "Dùng conditional để suy đoán quá khứ: Sería tarde = Có lẽ đã muộn.",
        "Kết hợp với trạng từ: quizás/tal vez, probablemente, en realidad."
      ],
      dialogueNote: "Suy đoán lịch sự thay vì khẳng định 100%.",
      practice: [
        "Tạo 6 câu suy đoán: Será... / Estará... (thời tiết, vị trí, thời gian).",
        "Tạo 3 câu suy đoán quá khứ với sería...",
        "Trả lời 5 câu hỏi bằng 'không chắc' + suy đoán."
      ]
    },
    44: {
      title: "Chiến lược giao tiếp: diễn đạt lại, hỏi lại, giữ nhịp nói",
      phrases: [
        "¿Qué significa...? — ... nghĩa là gì?",
        "¿Me lo puedes explicar? — Bạn có thể giải thích cho tôi không?",
        "Es decir, ... — Ý là...",
        "Déjame pensar... — Để tôi nghĩ..."
      ],
      grammar: [
        "B1 không chỉ là ngữ pháp mà còn là chiến lược: bạn biết \"sửa\" câu khi đang nói.",
        "Diễn đạt lại bằng từ đơn giản: Es una cosa que... / Es como... / Se usa para...",
        "Dùng từ đệm để không bị ngắt: bueno..., pues..., entonces..., a ver..."
      ],
      dialogueNote: "Hỏi nghĩa và duy trì cuộc trò chuyện.",
      practice: [
        "Chọn 5 từ lạ (từ bất kỳ bài đọc nào) và hỏi: ¿Qué significa...?",
        "Diễn đạt lại 3 từ bằng: Es como... / Se usa para...",
        "Đóng vai: nhờ nói lại/giải thích 3 lần một cách lịch sự."
      ]
    },
    45: {
      title: "Mốc B1: nói 2-3 phút + tự đánh giá",
      phrases: [
        "En mi opinión, ... — Theo ý tôi, ...",
        "Estoy de acuerdo. — Tôi đồng ý.",
        "No estoy de acuerdo. — Tôi không đồng ý.",
        "Cuéntame sobre tu trabajo. — Kể tôi nghe về công việc của bạn."
      ],
      grammar: [
        "Hôm nay là 'thi': kết hợp từ nối + quá khứ + tương lai + một chút subjuntivo.",
        "Ưu tiên rõ ràng hơn hoàn hảo. Nếu sai, sửa bằng: es decir..., quiero decir...",
        "Mẫu đơn: mở bài -> 3 ý -> ví dụ -> kết luận."
      ],
      dialogueNote: "Nêu ý kiến có đối lập (phong cách B1).",
      practice: [
        "Thu âm 2-3 phút: 'thành phố của tôi' hoặc 'công việc/việc học' với 5 từ nối.",
        "Trả lời 5 câu hỏi B1: kế hoạch, trải nghiệm, ý kiến, lời khuyên, giả định.",
        "Viết checklist ngắn: điểm yếu + kế hoạch 2 tuần tới."
      ]
    }
  },

  // Vocabulary translations (Spanish word -> Vietnamese)
  vocab: {
    1: {
      "cero": "số không",
      "uno": "một",
      "dos": "hai",
      "tres": "ba",
      "cuatro": "bốn",
      "cinco": "năm",
      "seis": "sáu",
      "siete": "bảy",
      "ocho": "tám",
      "nueve": "chín",
      "diez": "mười",
      "once": "mười một",
      "doce": "mười hai",
      "trece": "mười ba",
      "catorce": "mười bốn",
      "quince": "mười lăm",
      "dieciseis": "mười sáu",
      "diecisiete": "mười bảy",
      "dieciocho": "mười tám",
      "diecinueve": "mười chín",
      "veinte": "hai mươi"
    },
    2: {
      "bien": "tốt/khỏe",
      "mal": "tệ/không khỏe",
      "ahora": "bây giờ",
      "hoy": "hôm nay",
      "mañana": "ngày mai/buổi sáng",
      "ayer": "hôm qua",
      "siempre": "luôn luôn",
      "nunca": "không bao giờ",
      "a veces": "đôi khi",
      "gracias": "cảm ơn",
      "perdón": "xin lỗi"
    },
    3: {
      "yo": "tôi",
      "tú": "bạn",
      "él": "anh ấy",
      "ella": "cô ấy",
      "usted": "ông/bà",
      "nosotros": "chúng tôi",
      "ellos": "họ",
      "ser": "là (bản chất)",
      "nombre": "tên",
      "país": "quốc gia",
      "ciudad": "thành phố"
    },
    4: {
      "estar": "ở/đang (trạng thái)",
      "bien": "tốt/khỏe",
      "mal": "tệ/không khỏe",
      "cansado": "mệt",
      "enfermo": "ốm",
      "aquí": "ở đây",
      "allí": "ở đó",
      "en": "trong/trên/ở",
      "casa": "nhà",
      "hotel": "khách sạn",
      "restaurante": "nhà hàng"
    },
    5: {
      "hablar": "nói",
      "trabajar": "làm việc",
      "estudiar": "học",
      "aprender": "học (tiếp thu)",
      "necesitar": "cần",
      "hoy": "hôm nay",
      "ahora": "bây giờ",
      "también": "cũng",
      "pero": "nhưng",
      "porque": "vì"
    },
    6: {
      "comer": "ăn",
      "vivir": "sống",
      "leer": "đọc",
      "escribir": "viết",
      "ver": "thấy/xem",
      "escuchar": "nghe",
      "con": "với",
      "sin": "không có",
      "muy": "rất",
      "aquí": "ở đây"
    },
    7: {
      "tener": "có",
      "ir": "đi",
      "venir": "đến",
      "hacer": "làm",
      "poder": "có thể",
      "querer": "muốn/yêu",
      "tiempo": "thời gian/thời tiết",
      "ayuda": "giúp đỡ",
      "ahora": "bây giờ",
      "por favor": "làm ơn"
    },
    8: {
      "qué": "cái gì",
      "dónde": "ở đâu",
      "cuándo": "khi nào",
      "cómo": "như thế nào",
      "quién": "ai",
      "cuál": "cái nào",
      "cuánto": "bao nhiêu",
      "baño": "phòng tắm",
      "precio": "giá",
      "por favor": "làm ơn"
    },
    9: {
      "un": "một (nam)",
      "una": "một (nữ)",
      "el": "cái/con (nam)",
      "la": "cái/con (nữ)",
      "bueno": "tốt",
      "malo": "xấu",
      "bonito": "đẹp",
      "grande": "lớn",
      "pequeño": "nhỏ",
      "cuenta": "hóa đơn",
      "problema": "vấn đề"
    },
    10: {
      "hay": "có",
      "en": "trong/trên/ở",
      "cerca de": "gần",
      "lejos de": "xa",
      "delante de": "trước",
      "detrás de": "sau",
      "abierto": "mở",
      "cerrado": "đóng",
      "derecha": "phải",
      "izquierda": "trái",
      "recto": "thẳng"
    },
    11: {
      "levantarse": "thức dậy",
      "ducharse": "tắm",
      "acostarse": "đi ngủ",
      "por la mañana": "buổi sáng",
      "por la tarde": "buổi chiều",
      "por la noche": "buổi tối",
      "temprano": "sớm",
      "tarde": "muộn",
      "hora": "giờ",
      "día": "ngày",
      "todos los días": "mỗi ngày"
    },
    12: {
      "gustar": "thích",
      "encantar": "yêu thích",
      "preferir": "thích hơn",
      "música": "âm nhạc",
      "película": "phim",
      "libro": "sách",
      "deporte": "thể thao",
      "viajar": "du lịch",
      "también": "cũng",
      "pero": "nhưng"
    },
    13: {
      "ahora": "bây giờ",
      "ahora mismo": "ngay bây giờ",
      "mientras": "trong khi",
      "trabajar": "làm việc",
      "estudiar": "học",
      "hablar": "nói",
      "comer": "ăn",
      "vivir": "sống",
      "también": "cũng",
      "pero": "nhưng"
    },
    14: {
      "lo": "nó (nam)",
      "la": "nó (nữ)",
      "los": "chúng nó (nam)",
      "las": "chúng nó (nữ)",
      "tener": "có",
      "querer": "muốn/yêu",
      "comprar": "mua",
      "ver": "thấy/xem",
      "entender": "hiểu",
      "ahora": "bây giờ"
    },
    15: {
      "me": "tôi",
      "te": "bạn",
      "le": "cho anh/cô ấy",
      "les": "cho họ",
      "dar": "cho/đưa",
      "decir": "nói",
      "ayudar": "giúp",
      "mensaje": "tin nhắn",
      "verdad": "sự thật",
      "agua": "nước"
    },
    16: {
      "ayer": "hôm qua",
      "anoche": "tối qua",
      "la semana pasada": "tuần trước",
      "hace": "trước",
      "trabajar": "làm việc",
      "estudiar": "học",
      "hablar": "nói",
      "amigo": "bạn (nam)",
      "mucho": "nhiều",
      "poco": "một chút"
    },
    17: {
      "comer": "ăn",
      "vivir": "sống",
      "beber": "uống",
      "restaurante": "nhà hàng",
      "café": "cà phê",
      "primero": "đầu tiên",
      "luego": "sau đó",
      "finalmente": "cuối cùng",
      "ayer": "hôm qua",
      "descansar": "nghỉ ngơi"
    },
    18: {
      "ir": "đi",
      "tener": "có",
      "estar": "ở/đang",
      "hacer": "làm",
      "decir": "nói",
      "poder": "có thể",
      "poner": "đặt",
      "venir": "đến",
      "traer": "mang",
      "problema": "vấn đề",
      "verdad": "sự thật"
    },
    19: {
      "cuando": "khi",
      "siempre": "luôn luôn",
      "a veces": "đôi khi",
      "antes": "trước",
      "mientras": "trong khi",
      "ser": "là (bản chất)",
      "ir": "đi",
      "ver": "thấy/xem",
      "tener": "có",
      "tiempo": "thời gian/thời tiết",
      "año": "năm"
    },
    20: {
      "primero": "đầu tiên",
      "luego": "sau đó",
      "después": "sau",
      "antes": "trước",
      "mientras": "trong khi",
      "entonces": "vậy thì",
      "de repente": "đột nhiên",
      "porque": "vì",
      "aunque": "mặc dù",
      "por eso": "vì vậy"
    },
    21: {
      "más": "nhiều hơn",
      "menos": "ít hơn",
      "tan": "như vậy",
      "como": "như",
      "mejor": "tốt hơn",
      "peor": "tệ hơn",
      "barato": "rẻ",
      "caro": "đắt",
      "bonito": "đẹp",
      "diferente": "khác",
      "igual": "giống"
    },
    22: {
      "plan": "kế hoạch",
      "mañana": "ngày mai/buổi sáng",
      "viaje": "chuyến đi",
      "ir": "đi",
      "venir": "đến",
      "hacer": "làm",
      "reservar": "đặt trước",
      "salir": "đi ra/rời đi",
      "poder": "có thể",
      "necesitar": "cần"
    },
    23: {
      "ya": "rồi/bây giờ",
      "todavía": "vẫn còn",
      "nunca": "không bao giờ",
      "alguna vez": "đã bao giờ",
      "viajar": "du lịch",
      "comer": "ăn",
      "vivir": "sống",
      "probar": "thử",
      "verdad": "sự thật",
      "experiencia": "kinh nghiệm"
    },
    24: {
      "por": "vì/bởi/qua",
      "para": "cho/để",
      "porque": "vì",
      "por eso": "vì vậy",
      "por ejemplo": "ví dụ",
      "gracias": "cảm ơn",
      "ayuda": "giúp đỡ",
      "mañana": "ngày mai/buổi sáng",
      "dinero": "tiền",
      "calle": "đường phố"
    },
    25: {
      "ser": "là (bản chất)",
      "estar": "ở/đang (trạng thái)",
      "listo": "thông minh/sẵn sàng",
      "aburrido": "chán",
      "rico": "giàu/ngon",
      "feliz": "hạnh phúc",
      "triste": "buồn",
      "cansado": "mệt",
      "seguro": "an toàn/chắc chắn",
      "en realidad": "thực ra"
    },
    26: {
      "por favor": "làm ơn",
      "más": "nhiều hơn",
      "menos": "ít hơn",
      "rápido": "nhanh",
      "lento": "chậm",
      "decir": "nói",
      "venir": "đến",
      "hacer": "làm",
      "ir": "đi",
      "ahora": "bây giờ"
    },
    27: {
      "me": "tôi",
      "te": "bạn",
      "se": "(anh ấy/cô ấy/bản thân)",
      "lo": "nó (nam)",
      "la": "nó (nữ)",
      "dar": "cho/đưa",
      "decir": "nói",
      "traer": "mang",
      "ayudar": "giúp",
      "por favor": "làm ơn"
    },
    28: {
      "me gustaría": "tôi muốn",
      "podría": "tôi có thể",
      "quisiera": "tôi muốn",
      "poder": "có thể",
      "querer": "muốn/yêu",
      "pagar": "trả tiền",
      "posible": "có thể",
      "por favor": "làm ơn",
      "cuenta": "hóa đơn",
      "tarjeta": "thẻ"
    },
    29: {
      "tener que": "phải",
      "hay que": "cần phải",
      "deber": "nên/phải",
      "deberías": "bạn nên",
      "trabajar": "làm việc",
      "estudiar": "học",
      "descansar": "nghỉ ngơi",
      "practicar": "thực hành",
      "posible": "có thể",
      "necesario": "cần thiết"
    },
    30: {
      "perdón": "xin lỗi",
      "por favor": "làm ơn",
      "gracias": "cảm ơn",
      "claro": "tất nhiên",
      "vale": "được",
      "o sea": "ý tôi là",
      "entonces": "vậy thì",
      "por ejemplo": "ví dụ",
      "derecha": "phải",
      "izquierda": "trái",
      "recto": "thẳng"
    },
    31: {
      "cuando": "khi",
      "mientras": "trong khi",
      "antes": "trước",
      "después": "sau",
      "de repente": "đột nhiên",
      "soler": "thường làm",
      "pensar": "nghĩ",
      "conocer": "biết/quen",
      "mejor": "tốt hơn",
      "historia": "câu chuyện/lịch sử"
    },
    32: {
      "que": "mà/cái mà",
      "quien": "người mà",
      "donde": "nơi mà",
      "lo que": "điều mà",
      "algo": "cái gì đó",
      "persona": "người",
      "lugar": "nơi",
      "idea": "ý tưởng",
      "opinión": "ý kiến",
      "importante": "quan trọng"
    },
    33: {
      "ojalá": "hy vọng",
      "esperar": "chờ/hy vọng",
      "querer": "muốn/yêu",
      "venir": "đến",
      "practicar": "thực hành",
      "importante": "quan trọng",
      "posible": "có thể",
      "necesario": "cần thiết",
      "tiempo": "thời gian/thời tiết",
      "verdad": "sự thật"
    },
    34: {
      "me alegra": "tôi vui",
      "me molesta": "làm tôi khó chịu",
      "es una pena": "thật đáng tiếc",
      "feliz": "hạnh phúc",
      "triste": "buồn",
      "preocupar": "lo lắng",
      "poder": "có thể",
      "venir": "đến",
      "tarde": "muộn",
      "difícil": "khó"
    },
    35: {
      "creer": "tin/nghĩ",
      "dudar": "nghi ngờ",
      "verdad": "sự thật",
      "posible": "có thể",
      "necesario": "cần thiết",
      "tiempo": "thời gian/thời tiết",
      "llegar": "đến",
      "importante": "quan trọng",
      "en realidad": "thực ra",
      "quizás": "có lẽ"
    },
    36: {
      "cuando": "khi",
      "hasta que": "cho đến khi",
      "antes de que": "trước khi",
      "después de que": "sau khi",
      "llegar": "đến",
      "llamar": "gọi",
      "esperar": "chờ/hy vọng",
      "terminar": "hoàn thành",
      "salir": "đi ra/rời đi",
      "después": "sau"
    },
    37: {
      "opinión": "ý kiến",
      "idea": "ý tưởng",
      "porque": "vì",
      "aunque": "mặc dù",
      "sin embargo": "tuy nhiên",
      "además": "ngoài ra",
      "por lo tanto": "do đó",
      "en realidad": "thực ra",
      "en cambio": "ngược lại",
      "por eso": "vì vậy"
    },
    38: {
      "se": "(anh ấy/cô ấy/bản thân)",
      "se habla": "được nói",
      "vender": "bán",
      "entrada": "vé vào",
      "teléfono": "điện thoại",
      "olvidar": "quên",
      "caer": "rơi",
      "reserva": "đặt chỗ",
      "aquí": "ở đây",
      "en realidad": "thực ra"
    },
    39: {
      "decir": "nói",
      "preguntar": "hỏi",
      "contar": "kể",
      "si": "nếu/vâng",
      "que": "rằng/mà",
      "ocupado": "bận",
      "tiempo": "thời gian/thời tiết",
      "según": "theo",
      "médico": "bác sĩ",
      "salud": "sức khỏe"
    },
    40: {
      "si": "nếu/vâng",
      "tiempo": "thời gian/thời tiết",
      "posible": "có thể",
      "probable": "có khả năng",
      "poder": "có thể",
      "ir": "đi",
      "salir": "đi ra/rời đi",
      "viaje": "chuyến đi",
      "plan": "kế hoạch",
      "haría": "tôi sẽ làm"
    },
    41: {
      "quisiera": "tôi muốn",
      "pudiera": "nếu tôi có thể",
      "fuera": "nếu tôi là",
      "tuviera": "nếu tôi có",
      "ojalá": "hy vọng",
      "reservar": "đặt trước",
      "mesa": "bàn",
      "tiempo": "thời gian/thời tiết",
      "posible": "có thể",
      "haría": "tôi sẽ làm"
    },
    42: {
      "hoy": "hôm nay",
      "ayer": "hôm qua",
      "este año": "năm nay",
      "recientemente": "gần đây",
      "ya": "rồi/bây giờ",
      "todavía": "vẫn còn",
      "nunca": "không bao giờ",
      "alguna vez": "đã bao giờ",
      "viajar": "du lịch",
      "trabajo": "công việc"
    },
    43: {
      "estará": "có lẽ đang",
      "será": "có lẽ là",
      "sería": "có lẽ đã",
      "seguro": "an toàn/chắc chắn",
      "probable": "có khả năng",
      "quizás": "có lẽ",
      "tal vez": "có lẽ",
      "en realidad": "thực ra",
      "verdad": "sự thật",
      "tarde": "muộn"
    },
    44: {
      "significar": "có nghĩa",
      "explicar": "giải thích",
      "entender": "hiểu",
      "es decir": "nghĩa là",
      "o sea": "ý tôi là",
      "por ejemplo": "ví dụ",
      "claro": "tất nhiên",
      "vale": "được",
      "entonces": "vậy thì",
      "perdón": "xin lỗi"
    },
    45: {
      "en mi opinión": "theo ý tôi",
      "estoy de acuerdo": "tôi đồng ý",
      "no estoy de acuerdo": "tôi không đồng ý",
      "por lo tanto": "do đó",
      "sin embargo": "tuy nhiên",
      "además": "ngoài ra",
      "por ejemplo": "ví dụ",
      "historia": "câu chuyện/lịch sử",
      "plan": "kế hoạch",
      "idea": "ý tưởng"
    }
  }
};
