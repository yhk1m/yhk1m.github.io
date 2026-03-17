# Python으로 PPT 자동 생성하기

python-pptx 라이브러리를 활용하면 반복적인 프레젠테이션 작업을 자동화할 수 있습니다.

## 왜 자동화인가?

매 학기 수십 개의 발표 자료를 만들어야 할 때, 같은 템플릿에 데이터만 바꿔 넣는 작업은 자동화의 좋은 대상입니다.

## python-pptx 기본 사용법

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[1])
title = slide.shapes.title
title.text = "자동 생성된 슬라이드"

prs.save("output.pptx")
```

## 활용 사례

- 학생 개인별 성적표 슬라이드 생성
- 데이터 기반 차트 슬라이드 자동 생성
- 템플릿 기반 대량 발표 자료 제작

## 팁

마스터 슬라이드 레이아웃을 미리 디자인해두면, 코드에서는 텍스트와 데이터만 채워넣으면 됩니다. 디자인과 데이터를 분리하는 것이 핵심입니다.
