export interface IcebreakerContext {
  targetUserName: string;
  sharedInterests: string[];
  candidateCity: string;
  contextType: 'cafe' | 'food' | 'travel' | 'general';
}

export class ViViAIService {
  /**
   * Tạo câu mở lời bắt chuyện thông minh (Psychology-based Icebreaker)
   */
  public static async generateSmartIcebreaker(
    ctx: IcebreakerContext
  ): Promise<{ icebreaker: string; explanation: string }> {
    const primaryInterest = ctx.sharedInterests[0] || 'Du lịch';

    // Hệ thống sinh câu thông minh theo tâm lý học giao tiếp (Rule-based heuristics)
    const templates: Record<string, string[]> = {
      food: [
        `Chào ${ctx.targetUserName}, mình thấy bạn cũng mê ẩm thực ${ctx.candidateCity}! Bạn đã thử quán bánh tráng thịt heo Đại Lộc ở Hải Châu chưa, chuẩn vị lắm nè! 🍲`,
        `Hi ${ctx.targetUserName}! Cuối tuần này nhóm mình định làm một vòng food tour chợ đêm, bạn có hứng thú đi cùng không? ✨`,
      ],
      cafe: [
        `Chào ${ctx.targetUserName}, mình thấy bạn thích cafe yên tĩnh. Góc tầng 2 ở Nối Cafe ngắm hoàng hôn cực chill luôn, bạn ghé qua đó bao giờ chưa? ☕`,
        `Hi ${ctx.targetUserName}, bạn có gợi ý quán cafe view biển nào đẹp để chill cuối tuần ở ${ctx.candidateCity} không nhỉ? 🌊`,
      ],
      travel: [
        `Chào ${ctx.targetUserName}! Mình thấy bạn cũng thích phượt Sơn Trà. Chiều thứ 7 này tụi mình đổ đèo ngắm hoàng hôn, bạn đi cùng cho vui nhé! 🛵🌄`,
        `Hi ${ctx.targetUserName}, cuối tuần này bạn có kế hoạch khám phá địa điểm nào mới ở ${ctx.candidateCity} chưa? ✨`,
      ],
      general: [
        `Chào ${ctx.targetUserName}, thấy bạn cũng có cùng đam mê ${primaryInterest} với mình! Rất vui được làm quen với bạn trên VIVU nhé 🎉`,
      ],
    };

    const list = templates[ctx.contextType] || templates.general;
    const chosen = list[Math.floor(Math.random() * list.length)];

    return {
      icebreaker: chosen,
      explanation: `Gợi ý tự động dựa trên sở thích ${primaryInterest} và vị trí ${ctx.candidateCity}`,
    };
  }

  /**
   * Tạo 3 gợi ý phản hồi nhanh (Smart Contextual Replies)
   */
  public static generateSmartReplies(lastMessage: string): string[] {
    const lower = lastMessage.toLowerCase();
    if (lower.includes('khi nào') || lower.includes('mấy giờ') || lower.includes('thời gian')) {
      return [
        '17h chiều thứ 7 này nhé bạn!',
        'Mình rảnh vào khoảng 18h tối nay nè.',
        'Để mình check lại lịch rồi nhắn bạn ngay nhé!',
      ];
    }
    if (lower.includes('ở đâu') || lower.includes('địa điểm') || lower.includes('chỗ nào')) {
      return [
        'Gặp nhau ở quán Nối Cafe góc Hải Châu nhé!',
        'Ngay chân cầu Rồng hướng Bạch Đằng bạn nhé.',
        'Bạn chọn địa điểm đi, mình ở khu vực nào cũng tiện.',
      ];
    }
    if (lower.includes('đi không') || lower.includes('tham gia')) {
      return [
        'Nghe hấp dẫn quá, mình tham gia với nhé! 🎉',
        'Cho mình đăng ký 1 suất nha!',
        'Tiếc quá tuần này mình bận mất rồi, hẹn bạn lần sau nhé!',
      ];
    }

    return [
      'Nhất trí nhé! Hẹn gặp bạn.',
      'Cảm ơn bạn nhiều nhé! ✨',
      'Để mình rủ thêm bạn cùng đi cho đông vui nha.',
    ];
  }

  /**
   * Trả lời câu hỏi thông minh của người dùng về du lịch, ẩm thực, ghép cạ
   */
  public static async askViVi(question: string, city = 'Đà Nẵng'): Promise<string> {
    const qLower = question.toLowerCase();

    // Tri thức chuyên gia du lịch & kết nối VIVU
    if (qLower.includes('cafe') || qLower.includes('cà phê') || qLower.includes('nước')) {
      return `☕ Gợi ý cafe cực chill ở ${city}: Quán Nối Cafe (phong cách vintage hoài cổ), Sơn Trà Marina (view vịnh biển như Santorini thu nhỏ), hoặc Pavilion bãi biển Mỹ Khê. Bạn có thể bấm tạo hẹn để rủ bạn đi cùng nhé! 🌊`;
    }
    if (qLower.includes('ăn') || qLower.includes('món') || qLower.includes('quán') || qLower.includes('ẩm thực')) {
      return `🍲 Đến ${city} nhất định phải thử: Bánh tráng thịt heo Đại Lộc/Bà Mua, Bún chả cá 109 Nguyễn Chí Thanh, Bánh xèo tôm nhảy Năm Hiền và Hải sản Năm Đảnh. Chúc bạn có bữa ăn ngon miệng cùng các bạn VIVU! 😋`;
    }
    if (qLower.includes('chơi') || qLower.includes('checkin') || qLower.includes('tham quan') || qLower.includes('hoàng hôn')) {
      return `🌅 Điểm check-in hot nhất: Ngắm hoàng hôn trên Đỉnh Bàn Cờ - Bán đảo Sơn Trà, dạo cầu Tình Yêu & xem Cầu Rồng phun lửa vào 21h cuối tuần, hoặc bãi tắm Mỹ Khê lộng gió. Hãy tạo hoạt động để gom nhóm 4-6 người cùng đi cho vui nhé! 🛵`;
    }
    if (qLower.includes('làm quen') || qLower.includes('bắt chuyện') || qLower.includes('nhắn tin')) {
      return `💡 Mẹo kết bạn siêu mượt: Hãy nhìn vào sở thích chung trên hồ sơ bạn ấy (ví dụ: cắm trại, cafe sách, nhiếp ảnh), sau đó hỏi về trải nghiệm gần nhất hoặc rủ tham gia một sự kiện sắp diễn ra vào cuối tuần! ✨`;
    }

    return `ViVi sẵn sàng hỗ trợ bạn khám phá ${city}! Bạn có thể hỏi mình địa điểm ăn uống, quán cafe view biển, lịch trình săn ảnh hoàng hôn hoặc cách bắt chuyện tự nhiên với các bạn cùng sở thích nhé! ✨`;
  }
}
