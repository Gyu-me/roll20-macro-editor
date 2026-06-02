import type { MacroCategory } from "@/types/macro";

export const macroCategories: MacroCategory[] = [
  {
    id: "basic",
    name: "기본",
    description: "기본 출력",
    order: 1,
  },
  {
    id: "roll",
    name: "판정 / 주사위",
    description: "공개 주사위, 인라인 주사위, 판정 버튼",
    order: 2,
  },
  {
    id: "secret",
    name: "귓말",
    description: "GM 귓말, 캐릭터 귓말",
    order: 3,
  },
  {
    id: "scene",
    name: "장면 연출",
    description: "가름선, 챕터, BGM, 시계, 블러",
    order: 4,
  },
  {
    id: "info",
    name: "정보 / 핸드아웃 / 블러 처리",
    description: "핸드아웃, 조사 포인트, 얇은 글씨",
    order: 5,
  },
  {
    id: "decorate",
    name: "강조 / 꾸밈",
    description: "색상 강조, 굵게, 기울임, 박스 강조, 네온 효과",
    order: 6,
  },
  {
    id: "message",
    name: "메시지 / 말풍선",
    description: "카톡, 아이폰, 라인, 기본 말풍선",
    order: 7,
  },
  {
    id: "effect",
    name: "특수 효과",
    description: "광기 현재화, 게이지, 체력바, 특수 글씨",
    order: 8,
  },
  {
    id: "custom",
    name: "커스텀 / 시스템",
    description: "사용자 커스텀, 즐겨찾기, 최근 사용",
    order: 9,
  },
];