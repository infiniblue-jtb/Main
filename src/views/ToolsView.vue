<template>
  <div class="tools-page">

    <!-- ── 헤더 ───────────────────────────── -->
    <header class="fun-header">
      <div class="header-bg">
        <div class="grid-lines"></div>
        <div class="header-glow"></div>
      </div>
      <div class="header-content">
        <div class="header-badge">🛠️ TOOLS</div>
        <h1 class="header-title">
          <span class="title-line1">스마트한</span>
          <span class="title-line2">도구들</span>
        </h1>
        <p class="header-sub">연봉계산 · QR코드 · MBTI 등 자주 쓰는 도구 모음</p>
      </div>
    </header>

    <!-- ── 도구 카드 그리드 ─────────────────── -->
    <section class="tools-section">

      <!-- 카테고리1: 생활 계산기 -->
      <div class="category-header">
        <div class="category-badge hot">HOT</div>
        <h2 class="category-title">🧮 생활 계산기</h2>
        <div class="category-line"></div>
      </div>
      <div class="tools-grid">
        <div
          v-for="tool in calcTools"
          :key="tool.id"
          class="game-card"
          :class="`card-${tool.id}`"
          @click="openTool(tool.id)"
        >
          <div class="card-glow"></div>
          <div class="card-inner">
            <div class="card-icon">{{ tool.icon }}</div>
            <h3 class="card-name">{{ tool.name }}</h3>
            <p class="card-desc">{{ tool.desc }}</p>
            <div class="card-cta">
              <span>열기</span>
              <span class="cta-arrow">→</span>
            </div>
          </div>
          <div class="card-scan"></div>
        </div>
      </div>

      <!-- 카테고리2: 유틸리티 도구 -->
      <div class="category-header">
        <h2 class="category-title">🛠️ 유틸리티 도구</h2>
        <div class="category-line"></div>
      </div>
      <div class="tools-grid">
        <div
          v-for="tool in utilTools"
          :key="tool.id"
          class="game-card"
          :class="`card-${tool.id}`"
          @click="openTool(tool.id)"
        >
          <div class="card-glow"></div>
          <div class="card-inner">
            <div class="card-icon">{{ tool.icon }}</div>
            <h3 class="card-name">{{ tool.name }}</h3>
            <p class="card-desc">{{ tool.desc }}</p>
            <div class="card-cta">
              <span>열기</span>
              <span class="cta-arrow">→</span>
            </div>
          </div>
          <div class="card-scan"></div>
        </div>
      </div>

      <!-- 카테고리3: 재미 & 공유 -->
      <div class="category-header">
        <div class="category-badge viral">바이럴</div>
        <h2 class="category-title">🎯 재미 &amp; 공유</h2>
        <div class="category-line"></div>
      </div>
      <div class="tools-grid">
        <div
          v-for="tool in funTools"
          :key="tool.id"
          class="game-card"
          :class="`card-${tool.id}`"
          @click="openTool(tool.id)"
        >
          <div class="card-glow"></div>
          <div class="card-inner">
            <div class="card-icon">{{ tool.icon }}</div>
            <h3 class="card-name">{{ tool.name }}</h3>
            <p class="card-desc">{{ tool.desc }}</p>
            <div class="card-cta">
              <span>열기</span>
              <span class="cta-arrow">→</span>
            </div>
          </div>
          <div class="card-scan"></div>
        </div>
      </div>

    </section>

    <!-- Ad Unit -->
    <AdComponent slotId="9173007135" />

    <!-- ── 모달 ── -->
    <Transition name="modal">
      <div v-if="activeTool" class="modal-overlay" @click.self="closeTool">
        <div class="modal-box">
          <button class="modal-close" @click="closeTool">✕</button>

          <!-- ===== 연봉 실수령액 ===== -->
          <div v-if="activeTool === 'salary'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">💰</span>
              <h2>연봉 실수령액</h2>
            </div>
            <div class="form-group">
              <label class="form-label">연봉 (만원)</label>
              <input v-model.number="salaryInput" type="number" class="tool-input" placeholder="예: 4000" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">부양가족 수 (본인 포함)</label>
              <input v-model.number="salaryDependents" type="number" class="tool-input" placeholder="기본: 1" min="1" max="10" />
            </div>
            <button class="action-btn" @click="calcSalaryResult" style="width:100%;margin-top:8px;">계산하기</button>
            <div v-if="salaryResult" class="result-box">
              <table class="result-table">
                <tbody>
                  <tr><td>월 급여 (세전)</td><td class="val">{{ fmt(salaryResult.monthly) }}원</td></tr>
                  <tr><td>국민연금</td><td class="val minus">-{{ fmt(salaryResult.pension) }}원</td></tr>
                  <tr><td>건강보험</td><td class="val minus">-{{ fmt(salaryResult.health) }}원</td></tr>
                  <tr><td>장기요양보험</td><td class="val minus">-{{ fmt(salaryResult.ltc) }}원</td></tr>
                  <tr><td>고용보험</td><td class="val minus">-{{ fmt(salaryResult.employment) }}원</td></tr>
                  <tr><td>4대보험 합계</td><td class="val minus">-{{ fmt(salaryResult.total4) }}원</td></tr>
                  <tr><td>소득세</td><td class="val minus">-{{ fmt(salaryResult.monthlyTax) }}원</td></tr>
                  <tr><td>지방소득세</td><td class="val minus">-{{ fmt(salaryResult.localTax) }}원</td></tr>
                </tbody>
              </table>
              <div class="result-highlight">
                <div class="result-label">월 실수령액</div>
                <div class="result-amount">{{ fmt(salaryResult.net) }}원</div>
              </div>
              <p class="disclaimer">※ 간이세액 기준 근사치입니다</p>
            </div>
          </div>

          <!-- ===== 삼성 성과급 계산기 ===== -->
          <div v-if="activeTool === 'samsung'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">📈</span>
              <h2>삼성 성과급 계산기</h2>
            </div>
            <p class="tool-intro">계약연봉과 사업부를 선택하면 <b>OPI(초과이익성과급)</b>와 <b>TAI(목표달성장려금)</b> 예상 지급액을 자동 계산합니다.</p>

            <div class="form-group">
              <label class="form-label">계약연봉 (만원)</label>
              <input v-model.number="sbSalary" type="number" class="tool-input" placeholder="예: 7000" min="0" />
            </div>

            <div class="form-group">
              <label class="form-label">사업부 / 계열사</label>
              <select v-model="sbDivision" class="tool-input tool-select" @change="applySbDivision">
                <option v-for="d in sbDivisions" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>

            <div class="sb-rate-row">
              <div class="form-group">
                <label class="form-label">OPI 지급률 <span class="lbl-hint">연봉 대비 %</span></label>
                <input v-model.number="sbOpiRate" type="number" class="tool-input" min="0" step="0.5" />
              </div>
              <div class="form-group">
                <label class="form-label">TAI 지급률 <span class="lbl-hint">기본급 %·반기</span></label>
                <input v-model.number="sbTaiRate" type="number" class="tool-input" min="0" step="0.5" />
              </div>
            </div>

            <button class="action-btn" @click="calcSamsung" style="width:100%;margin-top:8px;" :disabled="!sbSalary">성과급 계산하기</button>

            <div v-if="sbResult" class="result-box">
              <div class="sb-badge" :style="{ background: sbResult.color + '22', borderColor: sbResult.color + '66', color: sbResult.color }">
                {{ sbResult.divName }}
              </div>
              <table class="result-table">
                <tbody>
                  <tr><td>월 기본급 (연봉 ÷ 12)</td><td class="val">{{ fmt(sbResult.monthlyBase) }}원</td></tr>
                  <tr><td>OPI 초과이익성과급 (연 1회)</td><td class="val plus">+{{ fmt(sbResult.opi) }}원</td></tr>
                  <tr><td>TAI 반기 1회 ({{ sbResult.taiRate }}%)</td><td class="val">{{ fmt(sbResult.taiHalf) }}원</td></tr>
                  <tr><td>TAI 연간 합계 (2회)</td><td class="val plus">+{{ fmt(sbResult.taiYear) }}원</td></tr>
                </tbody>
              </table>

              <div class="sb-bars">
                <div class="sb-bar-item">
                  <div class="sb-bar-label">OPI</div>
                  <div class="sb-bar-track"><div class="sb-bar-fill opi" :style="{ width: sbResult.opiPct + '%' }"></div></div>
                  <div class="sb-bar-val">{{ fmt(sbResult.opi) }}원</div>
                </div>
                <div class="sb-bar-item">
                  <div class="sb-bar-label">TAI</div>
                  <div class="sb-bar-track"><div class="sb-bar-fill tai" :style="{ width: sbResult.taiPct + '%' }"></div></div>
                  <div class="sb-bar-val">{{ fmt(sbResult.taiYear) }}원</div>
                </div>
              </div>

              <div class="result-highlight sb-highlight">
                <div class="result-label">연간 총 성과급 (세전)</div>
                <div class="result-amount">{{ fmt(sbResult.totalGross) }}원</div>
                <div class="sb-sub">연봉 대비 <b>{{ sbResult.ratioPct }}%</b> · 월 환산 +{{ fmt(sbResult.monthlyAdd) }}원</div>
              </div>

              <table class="result-table" style="margin-top:16px;">
                <tbody>
                  <tr><td>예상 세금·공제</td><td class="val minus">-{{ fmt(sbResult.tax) }}원</td></tr>
                  <tr><td>세후 실수령 성과급</td><td class="val net">{{ fmt(sbResult.totalNet) }}원</td></tr>
                  <tr><td>성과급 포함 총 연소득 (세전)</td><td class="val">{{ fmt(sbResult.grandTotal) }}원</td></tr>
                </tbody>
              </table>

              <button class="action-btn sm" @click="copySamsung" style="width:100%;margin-top:14px;">{{ sbCopied ? '✓ 복사됨!' : '📋 결과 공유하기' }}</button>
              <p class="disclaimer">※ 지급률은 2025년 사업부별 발표치 기준 추정값입니다. 개인 고과·회사 정책에 따라 실제 금액은 달라질 수 있으며, 세금은 근사치입니다.</p>
            </div>
          </div>

          <!-- ===== 4대보험 계산기 ===== -->
          <div v-if="activeTool === 'insurance'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🏥</span>
              <h2>4대보험 계산기</h2>
            </div>
            <div class="form-group">
              <label class="form-label">월 급여 (만원)</label>
              <input v-model.number="insuranceInput" type="number" class="tool-input" placeholder="예: 300" min="0" />
            </div>
            <button class="action-btn" @click="calcInsuranceResult" style="width:100%;margin-top:8px;">계산하기</button>
            <div v-if="insuranceResult" class="result-box">
              <table class="result-table">
                <tbody>
                  <tr><td>국민연금 (4.5%)</td><td class="val minus">{{ fmt(insuranceResult.pension) }}원</td></tr>
                  <tr><td>건강보험 (3.545%)</td><td class="val minus">{{ fmt(insuranceResult.health) }}원</td></tr>
                  <tr><td>장기요양 (건강×12.81%)</td><td class="val minus">{{ fmt(insuranceResult.ltc) }}원</td></tr>
                  <tr><td>고용보험 (0.9%)</td><td class="val minus">{{ fmt(insuranceResult.employment) }}원</td></tr>
                </tbody>
              </table>
              <div class="result-highlight">
                <div class="result-label">월 총 부담액</div>
                <div class="result-amount">{{ fmt(insuranceResult.total) }}원</div>
              </div>
            </div>
          </div>

          <!-- ===== 대출이자 계산기 ===== -->
          <div v-if="activeTool === 'loan'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🏦</span>
              <h2>대출이자 계산기</h2>
            </div>
            <div class="form-group">
              <label class="form-label">대출금액 (만원)</label>
              <input v-model.number="loanAmount" type="number" class="tool-input" placeholder="예: 10000" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">연이자율 (%)</label>
              <input v-model.number="loanRate" type="number" class="tool-input" placeholder="예: 4.5" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">대출기간 (개월)</label>
              <input v-model.number="loanMonths" type="number" class="tool-input" placeholder="예: 60" min="1" />
            </div>
            <div class="form-group">
              <label class="form-label">상환방식</label>
              <div class="radio-group">
                <label class="radio-label"><input type="radio" v-model="loanType" value="equal" /> 원리금균등</label>
                <label class="radio-label"><input type="radio" v-model="loanType" value="principal" /> 원금균등</label>
              </div>
            </div>
            <button class="action-btn" @click="calcLoanResult" style="width:100%;margin-top:8px;">계산하기</button>
            <div v-if="loanResult" class="result-box">
              <table class="result-table">
                <tbody>
                  <tr v-if="loanType === 'equal'"><td>월 납입금 (고정)</td><td class="val">{{ fmt(loanResult.monthly) }}원</td></tr>
                  <tr v-else><td>첫달 납입금</td><td class="val">{{ fmt(loanResult.firstMonth) }}원</td></tr>
                  <tr v-if="loanType === 'principal'"><td>마지막달 납입금</td><td class="val">{{ fmt(loanResult.lastMonth) }}원</td></tr>
                  <tr><td>총 이자</td><td class="val minus">{{ fmt(loanResult.totalInterest) }}원</td></tr>
                  <tr><td>총 납입금</td><td class="val">{{ fmt(loanResult.totalPayment) }}원</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ===== 퇴직금 계산기 ===== -->
          <div v-if="activeTool === 'severance'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">💼</span>
              <h2>퇴직금 계산기</h2>
            </div>
            <div class="form-group">
              <label class="form-label">입사일</label>
              <input v-model="severanceStart" type="date" class="tool-input" />
            </div>
            <div class="form-group">
              <label class="form-label">퇴사일</label>
              <input v-model="severanceEnd" type="date" class="tool-input" />
            </div>
            <div class="form-group">
              <label class="form-label">최근 3개월 급여 합계 (만원)</label>
              <input v-model.number="severanceSalary" type="number" class="tool-input" placeholder="예: 900" min="0" />
            </div>
            <button class="action-btn" @click="calcSeveranceResult" style="width:100%;margin-top:8px;">계산하기</button>
            <div v-if="severanceResult !== null" class="result-box">
              <div v-if="severanceResult === 'short'" class="result-notice">
                근무기간이 1년 미만으로 퇴직금이 발생하지 않습니다.
              </div>
              <div v-else class="result-highlight">
                <div class="result-label">퇴직금 (세전)</div>
                <div class="result-amount">{{ fmt(severanceResult) }}원</div>
              </div>
            </div>
          </div>

          <!-- ===== QR코드 생성기 ===== -->
          <div v-if="activeTool === 'qrcode'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">📱</span>
              <h2>QR코드 생성기</h2>
            </div>
            <div class="form-group">
              <label class="form-label">텍스트 또는 URL</label>
              <input v-model="qrText" type="text" class="tool-input" placeholder="https://example.com 또는 텍스트 입력" />
            </div>
            <button class="action-btn" @click="generateQR" style="width:100%;margin-top:8px;" :disabled="!qrText.trim()">QR 생성</button>
            <div v-if="qrError" class="result-notice error">{{ qrError }}</div>
            <div v-if="qrGenerated" class="qr-result">
              <canvas ref="qrCanvas" class="qr-canvas"></canvas>
              <button class="action-btn sm" @click="downloadQR">⬇️ 다운로드</button>
            </div>
          </div>

          <!-- ===== 이미지 압축 ===== -->
          <div v-if="activeTool === 'imgcompress'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🖼️</span>
              <h2>이미지 압축</h2>
            </div>
            <div class="form-group">
              <label class="form-label">이미지 선택</label>
              <div class="file-drop" @click="imgFileInput.click()" @dragover.prevent @drop.prevent="onImgDrop">
                <span v-if="!imgFile">📂 클릭 또는 파일을 여기에 드래그하세요</span>
                <span v-else>📎 {{ imgFile.name }} ({{ fmtBytes(imgFile.size) }})</span>
              </div>
              <input ref="imgFileInput" type="file" accept="image/*" style="display:none" @change="onImgFileChange" />
            </div>
            <div class="form-group">
              <label class="form-label">품질: {{ imgQuality }}%</label>
              <input v-model.number="imgQuality" type="range" min="10" max="95" step="5" class="range-input" />
            </div>
            <div class="form-group">
              <label class="form-label">최대 너비 (px, 0=원본)</label>
              <input v-model.number="imgMaxWidth" type="number" class="tool-input" placeholder="1920" min="0" />
            </div>
            <button class="action-btn" @click="compressImage" style="width:100%;margin-top:8px;" :disabled="!imgFile">압축하기</button>
            <div v-if="imgResult" class="result-box">
              <table class="result-table">
                <tbody>
                  <tr><td>원본 크기</td><td class="val">{{ fmtBytes(imgFile.size) }}</td></tr>
                  <tr><td>압축 크기</td><td class="val">{{ fmtBytes(imgResult.size) }}</td></tr>
                  <tr><td>절감률</td><td class="val" style="color:#6bcb77">{{ Math.round((1 - imgResult.size / imgFile.size) * 100) }}%</td></tr>
                </tbody>
              </table>
              <div class="img-preview-row">
                <img :src="imgResult.url" class="img-preview" alt="압축 결과" />
              </div>
              <a :href="imgResult.url" download="compressed.jpg" class="action-btn sm" style="margin-top:10px;display:inline-flex;">⬇️ 다운로드</a>
            </div>
          </div>

          <!-- ===== 글자수 세기 ===== -->
          <div v-if="activeTool === 'textcount'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">📝</span>
              <h2>글자수 세기</h2>
            </div>
            <textarea
              v-model="textInput"
              class="text-area"
              placeholder="여기에 텍스트를 입력하세요..."
              rows="8"
            ></textarea>
            <div class="result-box" style="margin-top:14px;">
              <table class="result-table">
                <tbody>
                  <tr><td>전체 글자수 (공백 포함)</td><td class="val">{{ textStats.total }}</td></tr>
                  <tr><td>공백 제외</td><td class="val">{{ textStats.noSpace }}</td></tr>
                  <tr><td>한글 자모음</td><td class="val">{{ textStats.korean }}</td></tr>
                  <tr><td>영문자</td><td class="val">{{ textStats.english }}</td></tr>
                  <tr><td>숫자</td><td class="val">{{ textStats.digits }}</td></tr>
                  <tr><td>줄 수</td><td class="val">{{ textStats.lines }}</td></tr>
                  <tr><td>바이트</td><td class="val">{{ textStats.bytes }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ===== D-day 계산기 ===== -->
          <div v-if="activeTool === 'dday'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">📅</span>
              <h2>D-day 계산기</h2>
            </div>
            <div class="form-group">
              <label class="form-label">기준일</label>
              <div style="display:flex;gap:8px;align-items:center;">
                <input v-model="ddayDate1" type="date" class="tool-input" style="flex:1" @change="computeDday" />
                <button class="action-btn sm" @click="ddayDate1 = todayStr(); computeDday()">오늘</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">목표일</label>
              <div style="display:flex;gap:8px;align-items:center;">
                <input v-model="ddayDate2" type="date" class="tool-input" style="flex:1" @change="computeDday" />
                <button class="action-btn sm" @click="ddayDate2 = todayStr(); computeDday()">오늘</button>
              </div>
            </div>
            <div class="dday-shortcuts">
              <button class="action-btn sm" @click="setDdayShortcut(0)">오늘</button>
              <button class="action-btn sm" @click="setDdayShortcut(100)">100일 후</button>
              <button class="action-btn sm" @click="setDdayShortcut(365)">1년 후</button>
            </div>
            <div v-if="ddayResult !== null" class="result-box" style="margin-top:16px;">
              <div class="result-highlight">
                <div class="result-label">{{ ddayResult >= 0 ? 'D+' + ddayResult : 'D' + ddayResult }}</div>
                <div class="result-amount" style="font-size:2rem;">{{ Math.abs(ddayResult) }}일</div>
              </div>
              <div class="dday-detail">
                약 {{ Math.floor(Math.abs(ddayResult) / 7) }}주 {{ Math.abs(ddayResult) % 7 }}일
              </div>
            </div>
          </div>

          <!-- ===== 반응속도 테스트 ===== -->
          <div v-if="activeTool === 'reaction'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">⚡</span>
              <h2>반응속도 테스트</h2>
            </div>
            <div class="reaction-info">
              라운드 {{ reactionRound }}/5
              <span v-if="reactionResults.length > 0"> | 평균: {{ reactionAvg }}ms</span>
            </div>
            <div
              class="reaction-box"
              :class="reactionState"
              @click="handleReactionClick"
            >
              <div class="reaction-text">
                <span v-if="reactionState === 'idle'">클릭하여 시작</span>
                <span v-else-if="reactionState === 'waiting'">초록색이 되면 클릭!</span>
                <span v-else-if="reactionState === 'early'">너무 빨리! 다시 클릭하세요</span>
                <span v-else-if="reactionState === 'ready'">지금!</span>
                <span v-else-if="reactionState === 'done'">{{ reactionLastMs }}ms</span>
                <span v-else-if="reactionState === 'finished'">완료! 평균 {{ reactionAvg }}ms</span>
              </div>
            </div>
            <div v-if="reactionResults.length > 0" class="reaction-results">
              <span v-for="(r, i) in reactionResults" :key="i" class="reaction-chip">{{ r }}ms</span>
            </div>
            <div v-if="reactionState === 'finished'" class="result-box" style="margin-top:14px;">
              <div class="result-highlight">
                <div class="result-label">등급</div>
                <div class="result-amount" style="font-size:1.6rem;">{{ reactionGrade }}</div>
              </div>
              <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
                <button class="action-btn sm" @click="copyReactionResult">📋 결과 복사</button>
                <button class="action-btn sm" @click="resetReaction">🔄 다시하기</button>
              </div>
            </div>
          </div>

          <!-- ===== MBTI 테스트 ===== -->
          <div v-if="activeTool === 'mbti'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🧠</span>
              <h2>MBTI 유형 테스트</h2>
            </div>

            <!-- 진행 중 -->
            <div v-if="!mbtiDone">
              <div class="mbti-progress-bar">
                <div class="mbti-progress-fill" :style="{ width: (mbtiCurrent / MBTI_QUESTIONS.length * 100) + '%' }"></div>
              </div>
              <div class="mbti-progress-text">{{ mbtiCurrent }} / {{ MBTI_QUESTIONS.length }}</div>
              <div class="mbti-question">{{ MBTI_QUESTIONS[mbtiCurrent].q }}</div>
              <div class="mbti-answers">
                <button
                  v-for="(ans, idx) in MBTI_QUESTIONS[mbtiCurrent].a"
                  :key="idx"
                  class="mbti-answer-btn"
                  @click="mbtiAnswer(idx)"
                >{{ ans }}</button>
              </div>
            </div>

            <!-- 결과 -->
            <div v-else class="mbti-result">
              <div class="mbti-type-card" :style="{ borderColor: MBTI_TYPES[mbtiType]?.color }">
                <div class="mbti-type-emoji">{{ MBTI_TYPES[mbtiType]?.emoji }}</div>
                <div class="mbti-type-code" :style="{ color: MBTI_TYPES[mbtiType]?.color }">{{ mbtiType }}</div>
                <div class="mbti-type-name">{{ MBTI_TYPES[mbtiType]?.name }}</div>
                <div class="mbti-type-desc">{{ MBTI_TYPES[mbtiType]?.desc }}</div>
              </div>
              <div class="mbti-btn-row">
                <button class="action-btn sm" @click="copyMbtiResult">📋 결과 공유</button>
                <button class="action-btn sm" @click="resetMbti">🔄 다시하기</button>
              </div>
            </div>
          </div>

          <!-- ===== 오늘의 운세 ===== -->
          <div v-if="activeTool === 'fortune'" class="game-wrap">
            <div class="game-title-row">
              <span class="g-icon">🔮</span>
              <h2>오늘의 운세</h2>
            </div>
            <div class="form-group">
              <label class="form-label">출생연도</label>
              <input v-model.number="fortuneYear" type="number" class="tool-input" placeholder="예: 1990" min="1900" max="2030" />
            </div>
            <button class="action-btn" @click="calcFortune" style="width:100%;margin-top:8px;" :disabled="!fortuneYear">운세 보기</button>
            <div v-if="fortuneResult" class="result-box">
              <div class="fortune-zodiac">
                <span class="fortune-zodiac-emoji">{{ fortuneResult.zodiac.emoji }}</span>
                <span class="fortune-zodiac-name">{{ fortuneResult.zodiac.name }}띠</span>
                <span class="fortune-date">{{ fortuneResult.date }}</span>
              </div>
              <div class="fortune-items">
                <div v-for="item in fortuneResult.items" :key="item.label" class="fortune-item">
                  <div class="fortune-item-header">
                    <span class="fortune-item-label">{{ item.label }}</span>
                    <span class="fortune-stars">{{ '⭐'.repeat(item.stars) }}{{ '☆'.repeat(5 - item.stars) }}</span>
                  </div>
                  <div class="fortune-item-msg">{{ item.msg }}</div>
                </div>
              </div>
            </div>
          </div>

        </div><!-- /.modal-box -->
      </div><!-- /.modal-overlay -->
    </Transition>

  </div>
</template>

<script>
import { ref, computed } from 'vue';
import AdComponent from '@/components/AdComponent.vue';

/* ── 도구 목록 ── */
const CALC_TOOLS = [
  { id: 'samsung',   icon: '📈', name: '삼성 성과급 계산기', desc: 'OPI·TAI 예상 성과급 + 세후 실수령' },
  { id: 'salary',    icon: '💰', name: '연봉 실수령액',   desc: '세금·4대보험 공제 후 실수령액' },
  { id: 'insurance', icon: '🏥', name: '4대보험 계산기',   desc: '직장인 월 부담 보험료 계산' },
  { id: 'loan',      icon: '🏦', name: '대출이자 계산기', desc: '원리금균등·원금균등 상환 계산' },
  { id: 'severance', icon: '💼', name: '퇴직금 계산기',   desc: '근무기간·평균임금 기반 산정' },
];
const UTIL_TOOLS = [
  { id: 'qrcode',      icon: '📱', name: 'QR코드 생성기', desc: '텍스트·URL을 QR코드로 변환' },
  { id: 'imgcompress', icon: '🖼️', name: '이미지 압축',   desc: '사진 용량 줄이기 (서버 전송 없음)' },
  { id: 'textcount',   icon: '📝', name: '글자수 세기',   desc: '자소서·SNS 글자수 카운터' },
  { id: 'dday',        icon: '📅', name: 'D-day 계산기',  desc: '날짜 간격·카운트다운 계산' },
];
const FUN_TOOLS = [
  { id: 'reaction', icon: '⚡', name: '반응속도 테스트',   desc: '나의 반응속도는 몇 ms? 친구와 비교!' },
  { id: 'mbti',     icon: '🧠', name: 'MBTI 유형 테스트', desc: '16가지 성격 유형 빠른 검사' },
  { id: 'fortune',  icon: '🔮', name: '오늘의 운세',       desc: '생년으로 보는 오늘의 띠 운세' },
];

/* ── 삼성 사업부별 성과급 지급률 (2025년 발표 기준 추정) ──
   opi: 초과이익성과급(OPI, 구 PS) — 계약연봉 대비 %, 연 1회(1월)
   tai: 목표달성장려금(TAI, 구 PI) — 월 기본급 대비 %, 반기 1회(연 2회) */
const SB_DIVISIONS = [
  { id: 'memory',  name: 'DS · 메모리(반도체)',      opi: 48,   tai: 100,  color: '#4d96ff' },
  { id: 'foundry', name: 'DS · 파운드리',            opi: 0,    tai: 25,   color: '#4d96ff' },
  { id: 'lsi',     name: 'DS · 시스템LSI',           opi: 10,   tai: 25,   color: '#4d96ff' },
  { id: 'mx',      name: 'DX · MX(모바일)',          opi: 50,   tai: 75,   color: '#6bcb77' },
  { id: 'vd',      name: 'DX · VD(영상디스플레이)',  opi: 12,   tai: 37.5, color: '#6bcb77' },
  { id: 'da',      name: 'DX · DA(생활가전)',        opi: 12,   tai: 37.5, color: '#6bcb77' },
  { id: 'network', name: 'DX · 네트워크',            opi: 12,   tai: 37.5, color: '#6bcb77' },
  { id: 'sdc',     name: '삼성디스플레이(SDC)',      opi: 38,   tai: 50,   color: '#a29bfe' },
  { id: 'semco',   name: '삼성전기',                 opi: 5,    tai: 25,   color: '#ff9f43' },
  { id: 'custom',  name: '직접 입력',                opi: 0,    tai: 0,    color: '#00f5ff' },
];

/* ── MBTI 질문 ── */
const MBTI_QUESTIONS = [
  { q: '에너지를 어디서 얻나요?', a: ['사람들과 함께할 때 활력이 생긴다', '혼자 있을 때 에너지가 충전된다'], dim: 'EI', score: [1,0] },
  { q: '새로운 사람들과 대화하는 것이...', a: ['즐겁고 재미있다', '피곤하고 부담스럽다'], dim: 'EI', score: [1,0] },
  { q: '생각을 정리할 때 주로...', a: ['말하면서 정리된다', '혼자 조용히 생각한다'], dim: 'EI', score: [1,0] },
  { q: '주말에 더 하고 싶은 것은?', a: ['친구·지인들과 만나기', '집에서 혼자 휴식'], dim: 'EI', score: [1,0] },
  { q: '더 관심 있는 것은?', a: ['지금 현실의 구체적인 문제', '미래의 가능성과 변화'], dim: 'SN', score: [1,0] },
  { q: '새로운 것을 배울 때...', a: ['단계별로 차근차근 배운다', '전체 그림을 먼저 파악한다'], dim: 'SN', score: [1,0] },
  { q: '더 신뢰하는 것은?', a: ['경험과 검증된 사실', '직관과 영감'], dim: 'SN', score: [1,0] },
  { q: '나는 주로...', a: ['현실적이고 실용적이다', '창의적이고 상상을 즐긴다'], dim: 'SN', score: [1,0] },
  { q: '결정할 때 중시하는 것은?', a: ['논리와 객관적 분석', '감정과 사람들의 가치'], dim: 'TF', score: [1,0] },
  { q: '친구가 잘못했을 때...', a: ['솔직하게 문제를 지적한다', '감정을 먼저 달래준다'], dim: 'TF', score: [1,0] },
  { q: '더 중요하다고 생각하는 것은?', a: ['진실·논리 (상처를 줘도)', '배려·감정 (불편해도)'], dim: 'TF', score: [1,0] },
  { q: '갈등 상황에서 나는...', a: ['감정보다 논리로 이야기한다', '상대 감정을 먼저 이해한다'], dim: 'TF', score: [1,0] },
  { q: '계획에 대해서...', a: ['미리 세우고 따르는 편이다', '즉흥적으로 행동하는 편이다'], dim: 'JP', score: [1,0] },
  { q: '마감 기한은...', a: ['여유있게 미리 끝낸다', '마감 직전 집중해서 끝낸다'], dim: 'JP', score: [1,0] },
  { q: '일상에서 나는...', a: ['정해진 루틴을 선호한다', '매번 새로운 방식을 시도한다'], dim: 'JP', score: [1,0] },
  { q: '일할 때...', a: ['하나씩 완전히 끝내고 넘어간다', '여러 일을 동시에 유연하게 한다'], dim: 'JP', score: [1,0] },
];

const MBTI_TYPES = {
  ISTJ: { name:'청렴결백한 논리주의자', emoji:'📋', color:'#4d96ff', desc:'책임감 강하고 신중한 현실주의자. 약속을 철저히 지키고 체계적으로 일합니다.' },
  ISFJ: { name:'용감한 수호자', emoji:'🛡️', color:'#6bcb77', desc:'헌신적이고 따뜻한 보호자. 타인을 배려하며 묵묵히 뒤에서 돕습니다.' },
  INFJ: { name:'선의의 옹호자', emoji:'🌟', color:'#a29bfe', desc:'이상을 추구하는 공감자. 깊은 통찰력과 강한 신념으로 세상을 변화시킵니다.' },
  INTJ: { name:'용의주도한 전략가', emoji:'♟️', color:'#00b4d8', desc:'독립적인 전략가. 복잡한 문제를 실행 계획으로 전환하는 능력이 탁월합니다.' },
  ISTP: { name:'만능 재주꾼', emoji:'🔧', color:'#ffd93d', desc:'차분하고 실용적인 문제 해결사. 위기 상황에서 침착하게 최선책을 찾습니다.' },
  ISFP: { name:'호기심 많은 예술가', emoji:'🎨', color:'#fd79a8', desc:'섬세하고 개성있는 감성인. 자유를 사랑하고 현재의 아름다움을 즐깁니다.' },
  INFP: { name:'열정적인 중재자', emoji:'🌸', color:'#ff9f43', desc:'이상주의적 공감자. 진정성 있는 관계를 추구하고 타인의 성장을 돕습니다.' },
  INTP: { name:'논리적인 사색가', emoji:'💡', color:'#00cec9', desc:'창의적인 분석가. 복잡한 이론을 탐구하며 독창적인 해결책을 찾습니다.' },
  ESTP: { name:'모험을 즐기는 사업가', emoji:'⚡', color:'#ff6b6b', desc:'에너지 넘치는 행동파. 위험을 즐기고 즉각적인 결과를 추구합니다.' },
  ESFP: { name:'자유로운 연예인', emoji:'🎉', color:'#ffeaa7', desc:'활발하고 즉흥적인 엔터테이너. 사람들과 어울리며 삶을 즐깁니다.' },
  ENFP: { name:'재기발랄한 활동가', emoji:'🌈', color:'#fab1a0', desc:'창의적인 열정가. 새로운 가능성을 탐색하고 사람들에게 영감을 줍니다.' },
  ENTP: { name:'뜨거운 논쟁을 즐기는 변론가', emoji:'🎭', color:'#74b9ff', desc:'독창적인 사상가. 아이디어 토론을 즐기고 혁신적인 해결책을 제시합니다.' },
  ESTJ: { name:'엄격한 관리자', emoji:'👔', color:'#a29bfe', desc:'조직적이고 책임감 있는 리더. 규칙과 질서로 팀을 이끌고 목표를 달성합니다.' },
  ESFJ: { name:'사교적인 외교관', emoji:'🤝', color:'#55efc4', desc:'따뜻하고 협력적인 조화자. 공동체를 중시하고 모두를 배려합니다.' },
  ENFJ: { name:'정의로운 사회운동가', emoji:'✨', color:'#fd79a8', desc:'카리스마 있는 멘토. 타인의 성장을 돕고 긍정적인 변화를 만들어냅니다.' },
  ENTJ: { name:'대담한 통솔자', emoji:'👑', color:'#e17055', desc:'자신감 넘치는 전략적 리더. 비효율을 개선하고 장기적 비전을 실현합니다.' },
};

/* ── 운세 ── */
const ZODIAC = [
  { key:0,  name:'원숭이', emoji:'🐒' },
  { key:1,  name:'닭',     emoji:'🐓' },
  { key:2,  name:'개',     emoji:'🐕' },
  { key:3,  name:'돼지',   emoji:'🐷' },
  { key:4,  name:'쥐',     emoji:'🐭' },
  { key:5,  name:'소',     emoji:'🐄' },
  { key:6,  name:'호랑이', emoji:'🐯' },
  { key:7,  name:'토끼',   emoji:'🐰' },
  { key:8,  name:'용',     emoji:'🐲' },
  { key:9,  name:'뱀',     emoji:'🐍' },
  { key:10, name:'말',     emoji:'🐴' },
  { key:11, name:'양',     emoji:'🐑' },
];

const FORTUNE_MSGS = {
  종합: ['뜻밖의 행운이 찾아오는 하루입니다.', '인내가 필요한 시기입니다. 차분히 기다리세요.', '새로운 기회가 문을 두드립니다.', '오늘은 과감한 도전이 빛을 발합니다.', '주변 사람들과의 소통에 집중하세요.', '오늘은 잠시 쉬어가는 것도 좋습니다.'],
  애정: ['소중한 인연이 가까이 있습니다.', '솔직한 마음을 전할 기회입니다.', '감정보다 이성으로 판단하세요.', '상대방의 말에 귀 기울여보세요.', '혼자만의 시간이 오히려 관계에 도움이 됩니다.', '작은 배려가 큰 감동을 줍니다.'],
  금전: ['예상치 못한 수입이 생길 수 있습니다.', '충동구매를 조심하세요.', '투자보다 저축에 집중할 때입니다.', '재물운이 서서히 올라가고 있습니다.', '주변 조언을 참고해 현명하게 결정하세요.', '작은 지출이 모여 큰 낭비가 됩니다.'],
  건강: ['컨디션이 최상인 날입니다.', '무리한 일정은 피하고 충분히 쉬세요.', '가벼운 운동이 기분 전환에 도움이 됩니다.', '수분 섭취를 충분히 하세요.', '식사를 거르지 않는 것이 중요합니다.', '숙면이 내일의 활력소가 됩니다.'],
  직장: ['상사의 인정을 받을 수 있는 날입니다.', '팀워크가 빛을 발하는 하루입니다.', '새로운 프로젝트에 도전해보세요.', '꼼꼼한 마무리가 좋은 결과를 가져옵니다.', '동료와의 협력이 성과로 이어집니다.', '오늘은 계획한 일에 집중하세요.'],
};

const seededRng = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = s * 16807 % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/* ── 연봉 계산 함수 ── */
function laborDeduction(annual) {
  if (annual <= 5_000_000) return annual * 0.70;
  if (annual <= 15_000_000) return 3_500_000 + (annual - 5_000_000) * 0.40;
  if (annual <= 45_000_000) return 7_500_000 + (annual - 15_000_000) * 0.15;
  if (annual <= 100_000_000) return 12_000_000 + (annual - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (annual - 100_000_000) * 0.02, 20_000_000);
}

function incomeTax(base) {
  if (base <= 0) return 0;
  if (base <= 14_000_000) return base * 0.06;
  if (base <= 50_000_000) return base * 0.15 - 1_260_000;
  if (base <= 88_000_000) return base * 0.24 - 5_760_000;
  if (base <= 150_000_000) return base * 0.35 - 15_440_000;
  if (base <= 300_000_000) return base * 0.38 - 19_940_000;
  if (base <= 500_000_000) return base * 0.40 - 25_940_000;
  return base * 0.42 - 35_940_000;
}

function calcSalaryFull(annualWon, dependents) {
  const monthly    = annualWon / 12;
  const pension    = Math.min(monthly, 5_900_000) * 0.045;
  const health     = monthly * 0.03545;
  const ltc        = health * 0.1281;
  const employment = monthly * 0.009;
  const total4     = pension + health + ltc + employment;
  const deduction  = laborDeduction(annualWon);
  const personal   = 1_500_000 * dependents;
  const taxBase    = Math.max(0, annualWon - deduction - personal);
  let   annTax     = incomeTax(taxBase);
  const credit     = annualWon <= 33_000_000 ? Math.min(annTax * 0.55, 660_000) : Math.min(annTax * 0.30, 500_000);
  annTax           = Math.max(0, annTax - credit);
  const monthlyTax = annTax / 12;
  const localTax   = monthlyTax * 0.1;
  const net        = monthly - total4 - monthlyTax - localTax;
  return { monthly, pension, health, ltc, employment, total4, monthlyTax, localTax, net };
}

export default {
  name: 'ToolsView',
  components: { AdComponent },
  setup() {
    const calcTools = CALC_TOOLS;
    const utilTools = UTIL_TOOLS;
    const funTools  = FUN_TOOLS;

    const activeTool = ref(null);

    /* ── 공통 포맷 ── */
    const fmt = (v) => Math.round(v).toLocaleString();
    const fmtBytes = (b) => {
      if (b < 1024) return b + ' B';
      if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
      return (b / (1024 * 1024)).toFixed(2) + ' MB';
    };
    const todayStr = () => new Date().toISOString().slice(0, 10);

    /* ── 리셋 ── */
    const resetAll = () => {
      salaryResult.value     = null;
      sbSalary.value         = '';
      sbDivision.value       = 'memory';
      sbOpiRate.value        = 48;
      sbTaiRate.value        = 100;
      sbResult.value         = null;
      sbCopied.value         = false;
      insuranceResult.value  = null;
      loanResult.value       = null;
      severanceResult.value  = null;
      qrText.value           = '';
      qrGenerated.value      = false;
      qrError.value          = '';
      imgFile.value          = null;
      imgResult.value        = null;
      imgQuality.value       = 80;
      imgMaxWidth.value      = 1920;
      textInput.value        = '';
      ddayDate1.value        = todayStr();
      ddayDate2.value        = '';
      ddayResult.value       = null;
      resetReaction();
      resetMbti();
      fortuneResult.value    = null;
    };

    const openTool  = (id) => { resetAll(); activeTool.value = id; };
    const closeTool = ()   => { activeTool.value = null; };

    /* ══════════ 연봉 실수령액 ══════════ */
    const salaryInput      = ref('');
    const salaryDependents = ref(1);
    const salaryResult     = ref(null);

    const calcSalaryResult = () => {
      const annual = (salaryInput.value || 0) * 10000;
      if (!annual) return;
      salaryResult.value = calcSalaryFull(annual, salaryDependents.value || 1);
    };

    /* ══════════ 삼성 성과급 ══════════ */
    const sbDivisions = SB_DIVISIONS;
    const sbSalary    = ref('');
    const sbDivision  = ref('memory');
    const sbOpiRate   = ref(48);
    const sbTaiRate   = ref(100);
    const sbResult    = ref(null);
    const sbCopied    = ref(false);

    const applySbDivision = () => {
      const d = SB_DIVISIONS.find(x => x.id === sbDivision.value);
      if (d && d.id !== 'custom') { sbOpiRate.value = d.opi; sbTaiRate.value = d.tai; }
    };

    const calcSamsung = () => {
      const annual = (sbSalary.value || 0) * 10000;
      if (!annual) return;
      const monthlyBase = annual / 12;
      const opiRate = sbOpiRate.value || 0;
      const taiRate = sbTaiRate.value || 0;
      const opi     = annual * opiRate / 100;          // 연봉 대비, 연 1회
      const taiHalf = monthlyBase * taiRate / 100;     // 기본급 대비, 반기 1회
      const taiYear = taiHalf * 2;                      // 연 2회
      const totalGross = opi + taiYear;

      // 세금 근사: 성과급 추가분에 대한 한계세율 적용 (근로소득공제·기본공제 1인 가정)
      const personal  = 1_500_000;
      const baseA     = Math.max(0, annual - laborDeduction(annual) - personal);
      const baseB     = Math.max(0, annual + totalGross - laborDeduction(annual + totalGross) - personal);
      let   incTax    = Math.max(0, incomeTax(baseB) - incomeTax(baseA));
      const localTax  = incTax * 0.1;                   // 지방소득세 10%
      const emp       = totalGross * 0.009;             // 고용보험 0.9%
      const tax       = incTax + localTax + emp;
      const totalNet  = totalGross - tax;

      const d    = SB_DIVISIONS.find(x => x.id === sbDivision.value) || {};
      const maxv = Math.max(opi, taiYear, 1);

      sbResult.value = {
        divName: d.name || '직접입력',
        color: d.color || '#00f5ff',
        monthlyBase, opi, taiHalf, taiYear, taiRate, totalGross,
        tax, totalNet,
        grandTotal: annual + totalGross,
        monthlyAdd: totalGross / 12,
        ratioPct: (totalGross / annual * 100).toFixed(1),
        opiPct: opi / maxv * 100,
        taiPct: taiYear / maxv * 100,
      };
      sbCopied.value = false;
    };

    const copySamsung = () => {
      if (!sbResult.value) return;
      const r = sbResult.value;
      const txt =
        `📈 삼성 성과급 예상 — ${r.divName}\n` +
        `계약연봉 ${fmt((sbSalary.value || 0) * 10000)}원\n` +
        `─────────────\n` +
        `OPI (연1회)  ${fmt(r.opi)}원\n` +
        `TAI (연2회)  ${fmt(r.taiYear)}원\n` +
        `연간 총 성과급 ${fmt(r.totalGross)}원 (세전)\n` +
        `세후 추정     ${fmt(r.totalNet)}원\n` +
        `연봉 대비 ${r.ratioPct}%`;
      const done = () => { sbCopied.value = true; setTimeout(() => { sbCopied.value = false; }, 2000); };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(() => {});
      } else { done(); }
    };

    /* ══════════ 4대보험 ══════════ */
    const insuranceInput  = ref('');
    const insuranceResult = ref(null);

    const calcInsuranceResult = () => {
      const monthly = (insuranceInput.value || 0) * 10000;
      if (!monthly) return;
      const pension    = Math.min(monthly, 5_900_000) * 0.045;
      const health     = monthly * 0.03545;
      const ltc        = health * 0.1281;
      const employment = monthly * 0.009;
      insuranceResult.value = { pension, health, ltc, employment, total: pension + health + ltc + employment };
    };

    /* ══════════ 대출이자 ══════════ */
    const loanAmount = ref('');
    const loanRate   = ref('');
    const loanMonths = ref('');
    const loanType   = ref('equal');
    const loanResult = ref(null);

    const calcLoanResult = () => {
      const P = (loanAmount.value || 0) * 10000;
      const r = (loanRate.value || 0) / 100 / 12;
      const n = loanMonths.value || 0;
      if (!P || !r || !n) return;

      if (loanType.value === 'equal') {
        const factor       = Math.pow(1 + r, n);
        const monthly      = P * r * factor / (factor - 1);
        const totalPayment = monthly * n;
        loanResult.value   = { monthly, totalInterest: totalPayment - P, totalPayment };
      } else {
        const ppMonth     = P / n;
        const firstMonth  = ppMonth + P * r;
        const lastMonth   = ppMonth + ppMonth * r;
        const totalInterest = r * P * (n + 1) / 2;
        loanResult.value  = { firstMonth, lastMonth, totalInterest, totalPayment: P + totalInterest };
      }
    };

    /* ══════════ 퇴직금 ══════════ */
    const severanceStart  = ref('');
    const severanceEnd    = ref('');
    const severanceSalary = ref('');
    const severanceResult = ref(null);

    const calcSeveranceResult = () => {
      if (!severanceStart.value || !severanceEnd.value || !severanceSalary.value) return;
      const days = (new Date(severanceEnd.value) - new Date(severanceStart.value)) / 86400000;
      if (days < 365) { severanceResult.value = 'short'; return; }
      const dailyAvg = (severanceSalary.value * 10000) / 91;
      severanceResult.value = dailyAvg * 30 * (days / 365);
    };

    /* ══════════ QR코드 ══════════ */
    const qrText      = ref('');
    const qrCanvas    = ref(null);
    const qrGenerated = ref(false);
    const qrError     = ref('');

    const loadQRLib = () => new Promise((resolve, reject) => {
      if (window.QRCode) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });

    const generateQR = async () => {
      qrError.value     = '';
      qrGenerated.value = false;
      try {
        await loadQRLib();
        await window.QRCode.toCanvas(qrCanvas.value, qrText.value, {
          width: 256, margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        });
        qrGenerated.value = true;
      } catch {
        qrError.value = 'QR 생성 실패. 인터넷 연결을 확인해주세요.';
      }
    };

    const downloadQR = () => {
      if (!qrCanvas.value) return;
      const a = document.createElement('a');
      a.href = qrCanvas.value.toDataURL(); a.download = 'qrcode.png'; a.click();
    };

    /* ══════════ 이미지 압축 ══════════ */
    const imgFile      = ref(null);
    const imgFileInput = ref(null);
    const imgQuality   = ref(80);
    const imgMaxWidth  = ref(1920);
    const imgResult    = ref(null);

    const onImgFileChange = (e) => { imgFile.value = e.target.files[0] || null; imgResult.value = null; };
    const onImgDrop       = (e) => { imgFile.value = e.dataTransfer.files[0] || null; imgResult.value = null; };

    const compressImage = () => {
      const file = imgFile.value;
      if (!file) return;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas  = document.createElement('canvas');
        const maxW    = imgMaxWidth.value || img.width;
        const ratio   = Math.min(maxW / img.width, 1);
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          imgResult.value = { blob, url: URL.createObjectURL(blob), size: blob.size };
        }, 'image/jpeg', imgQuality.value / 100);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };

    /* ══════════ 글자수 세기 ══════════ */
    const textInput = ref('');

    const textStats = computed(() => {
      const t = textInput.value;
      let bytes = 0;
      for (const c of t) bytes += c.charCodeAt(0) > 127 ? 3 : 1;
      return {
        total:   t.length,
        noSpace: t.replace(/\s/g, '').length,
        korean:  (t.match(/[가-힣ㄱ-ㆎ]/g) || []).length,
        english: (t.match(/[a-zA-Z]/g) || []).length,
        digits:  (t.match(/[0-9]/g) || []).length,
        lines:   t === '' ? 0 : t.split('\n').length,
        bytes,
      };
    });

    /* ══════════ D-day ══════════ */
    const ddayDate1  = ref(todayStr());
    const ddayDate2  = ref('');
    const ddayResult = ref(null);

    const computeDday = () => {
      if (!ddayDate1.value || !ddayDate2.value) return;
      ddayResult.value = Math.round((new Date(ddayDate2.value) - new Date(ddayDate1.value)) / 86400000);
    };

    const setDdayShortcut = (offsetDays) => {
      ddayDate1.value = todayStr();
      const d = new Date(); d.setDate(d.getDate() + offsetDays);
      ddayDate2.value = d.toISOString().slice(0, 10);
      computeDday();
    };

    /* ══════════ 반응속도 ══════════ */
    const reactionState   = ref('idle');
    const reactionResults = ref([]);
    const reactionRound   = ref(1);
    const reactionLastMs  = ref(0);
    let   reactionTimer   = null;
    let   reactionStart   = 0;

    const reactionAvg = computed(() => {
      if (!reactionResults.value.length) return 0;
      return Math.round(reactionResults.value.reduce((a, b) => a + b, 0) / reactionResults.value.length);
    });

    const reactionGrade = computed(() => {
      const avg = reactionAvg.value;
      if (avg <= 150) return '프로게이머 🎮';
      if (avg <= 200) return '빠름 ⚡';
      if (avg <= 250) return '보통 👍';
      if (avg <= 300) return '느림 🐢';
      return '거북이 🐢🐢';
    });

    const startReactionRound = () => {
      reactionState.value = 'waiting';
      reactionTimer = setTimeout(() => {
        reactionState.value = 'ready';
        reactionStart = Date.now();
      }, 1000 + Math.random() * 3000);
    };

    const handleReactionClick = () => {
      if (reactionState.value === 'idle' || reactionState.value === 'done' || reactionState.value === 'early') {
        startReactionRound();
      } else if (reactionState.value === 'waiting') {
        clearTimeout(reactionTimer);
        reactionState.value = 'early';
      } else if (reactionState.value === 'ready') {
        const ms = Date.now() - reactionStart;
        reactionLastMs.value = ms;
        reactionResults.value.push(ms);
        if (reactionRound.value >= 5) {
          reactionState.value = 'finished';
        } else {
          reactionRound.value++;
          reactionState.value = 'done';
        }
      }
    };

    const resetReaction = () => {
      clearTimeout(reactionTimer);
      reactionState.value   = 'idle';
      reactionResults.value = [];
      reactionRound.value   = 1;
      reactionLastMs.value  = 0;
    };

    const copyReactionResult = () => {
      const text = `내 반응속도: ${reactionAvg.value}ms (${reactionGrade.value}) | 측정: ${reactionResults.value.join(', ')}ms`;
      navigator.clipboard?.writeText(text).catch(() => {});
    };

    /* ══════════ MBTI ══════════ */
    const mbtiCurrent = ref(0);
    const mbtiScores  = ref({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    const mbtiDone    = ref(false);
    const mbtiType    = ref('');

    const mbtiAnswer = (idx) => {
      const q = MBTI_QUESTIONS[mbtiCurrent.value];
      const s = q.score[idx];
      const sc = mbtiScores.value;
      if (q.dim === 'EI') { if (s) sc.E++; else sc.I++; }
      if (q.dim === 'SN') { if (s) sc.S++; else sc.N++; }
      if (q.dim === 'TF') { if (s) sc.T++; else sc.F++; }
      if (q.dim === 'JP') { if (s) sc.J++; else sc.P++; }

      if (mbtiCurrent.value < MBTI_QUESTIONS.length - 1) {
        mbtiCurrent.value++;
      } else {
        mbtiType.value =
          (sc.E >= sc.I ? 'E' : 'I') +
          (sc.S >= sc.N ? 'S' : 'N') +
          (sc.T >= sc.F ? 'T' : 'F') +
          (sc.J >= sc.P ? 'J' : 'P');
        mbtiDone.value = true;
      }
    };

    const resetMbti = () => {
      mbtiCurrent.value = 0;
      mbtiScores.value  = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
      mbtiDone.value    = false;
      mbtiType.value    = '';
    };

    const copyMbtiResult = () => {
      const t = MBTI_TYPES[mbtiType.value];
      navigator.clipboard?.writeText(`나의 MBTI: ${mbtiType.value} - ${t?.name} ${t?.emoji}`).catch(() => {});
    };

    /* ══════════ 운세 ══════════ */
    const fortuneYear   = ref('');
    const fortuneResult = ref(null);

    const calcFortune = () => {
      const year = fortuneYear.value;
      if (!year) return;
      const zodiac = ZODIAC.find(z => z.key === (year % 12)) || ZODIAC[0];
      const today  = new Date();
      const seed   = year * 10000 + today.getFullYear() * 100 + today.getMonth() * 10 + today.getDate();
      const rng    = seededRng(seed);

      const items = ['종합', '애정', '금전', '건강', '직장'].map(label => {
        const msgs  = FORTUNE_MSGS[label];
        const stars = Math.floor(rng() * 5) + 1;
        const msg   = msgs[Math.floor(rng() * msgs.length)];
        return { label, stars, msg };
      });

      fortuneResult.value = {
        zodiac, items,
        date: `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`,
      };
    };

    return {
      calcTools, utilTools, funTools,
      activeTool, openTool, closeTool,
      fmt, fmtBytes, todayStr,
      salaryInput, salaryDependents, salaryResult, calcSalaryResult,
      sbDivisions, sbSalary, sbDivision, sbOpiRate, sbTaiRate, sbResult, sbCopied,
      applySbDivision, calcSamsung, copySamsung,
      insuranceInput, insuranceResult, calcInsuranceResult,
      loanAmount, loanRate, loanMonths, loanType, loanResult, calcLoanResult,
      severanceStart, severanceEnd, severanceSalary, severanceResult, calcSeveranceResult,
      qrText, qrCanvas, qrGenerated, qrError, generateQR, downloadQR,
      imgFile, imgFileInput, imgQuality, imgMaxWidth, imgResult,
      onImgFileChange, onImgDrop, compressImage,
      textInput, textStats,
      ddayDate1, ddayDate2, ddayResult, setDdayShortcut, computeDday,
      reactionState, reactionResults, reactionRound, reactionLastMs, reactionAvg, reactionGrade,
      handleReactionClick, resetReaction, copyReactionResult,
      MBTI_QUESTIONS, MBTI_TYPES,
      mbtiCurrent, mbtiDone, mbtiType, mbtiAnswer, resetMbti, copyMbtiResult,
      fortuneYear, fortuneResult, calcFortune,
    };
  }
};
</script>

<style scoped>
.tools-page {
  min-height: 100vh;
  background: #0d0d1a;
  color: #e0e0f0;
  font-family: 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', sans-serif;
  overflow-x: hidden;
}

/* ── 헤더 ── */
.fun-header { position: relative; padding: 80px 24px 60px; text-align: center; overflow: hidden; }
.header-bg  { position: absolute; inset: 0; pointer-events: none; }
.grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(0,245,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,245,255,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: grid-scroll 20s linear infinite;
}
@keyframes grid-scroll { from { background-position: 0 0; } to { background-position: 40px 40px; } }
.header-glow {
  position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
  width: 500px; height: 300px;
  background: radial-gradient(ellipse, rgba(0,245,255,0.18) 0%, transparent 70%);
}
.header-content { position: relative; }
.header-badge {
  display: inline-block;
  background: rgba(0,245,255,0.12); border: 1px solid rgba(0,245,255,0.4);
  color: #00f5ff; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em;
  padding: 6px 16px; border-radius: 30px; margin-bottom: 20px;
}
.header-title { display: flex; flex-direction: column; align-items: center; line-height: 1; margin-bottom: 16px; }
.title-line1 { font-size: clamp(1.8rem,6vw,3rem); font-weight: 300; color: rgba(255,255,255,0.5); letter-spacing: 0.15em; }
.title-line2 {
  font-size: clamp(3.5rem,12vw,7rem); font-weight: 900; letter-spacing: -0.02em;
  background: linear-gradient(135deg,#00f5ff,#a29bfe,#fd79a8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.header-sub { font-size: 1rem; color: rgba(255,255,255,0.35); letter-spacing: 0.05em; }

/* ── 섹션 & 카테고리 ── */
.tools-section { max-width: 1100px; margin: 0 auto; padding: 0 24px 100px; }

.category-header {
  display: flex; align-items: center; gap: 12px;
  margin: 48px 0 18px;
}
.category-title { font-size: 1.2rem; font-weight: 800; color: rgba(255,255,255,0.85); margin: 0; white-space: nowrap; }
.category-line  { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
.category-badge {
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.12em;
  padding: 3px 10px; border-radius: 20px; white-space: nowrap;
}
.category-badge.hot   { background: rgba(255,107,107,0.2); border: 1px solid rgba(255,107,107,0.5); color: #ff6b6b; }
.category-badge.viral { background: rgba(162,155,254,0.2); border: 1px solid rgba(162,155,254,0.5); color: #a29bfe; }

/* ── 카드 그리드 ── */
.tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }

.game-card {
  position: relative; border-radius: 20px; overflow: hidden; cursor: pointer;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.35s cubic-bezier(.2,.8,.2,1), border-color 0.3s;
}
.game-card:hover { transform: translateY(-8px) scale(1.02); border-color: rgba(0,245,255,0.4); }
.game-card:hover .card-glow { opacity: 1; }
.game-card:hover .card-scan { animation-play-state: running; }
.game-card:hover .cta-arrow { transform: translateX(4px); }

.card-glow { position: absolute; inset: 0; border-radius: 20px; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.card-samsung    .card-glow { box-shadow: inset 0 0 40px rgba(77,150,255,0.28); }
.card-salary     .card-glow { box-shadow: inset 0 0 40px rgba(255,215,61,0.25); }
.card-insurance  .card-glow { box-shadow: inset 0 0 40px rgba(107,203,119,0.25); }
.card-loan       .card-glow { box-shadow: inset 0 0 40px rgba(77,150,255,0.25); }
.card-severance  .card-glow { box-shadow: inset 0 0 40px rgba(162,155,254,0.25); }
.card-qrcode     .card-glow { box-shadow: inset 0 0 40px rgba(0,245,255,0.25); }
.card-imgcompress .card-glow { box-shadow: inset 0 0 40px rgba(253,121,168,0.25); }
.card-textcount  .card-glow { box-shadow: inset 0 0 40px rgba(255,159,67,0.25); }
.card-dday       .card-glow { box-shadow: inset 0 0 40px rgba(0,180,200,0.25); }
.card-reaction   .card-glow { box-shadow: inset 0 0 40px rgba(255,107,107,0.25); }
.card-mbti       .card-glow { box-shadow: inset 0 0 40px rgba(162,155,254,0.25); }
.card-fortune    .card-glow { box-shadow: inset 0 0 40px rgba(107,203,119,0.25); }

.card-scan {
  position: absolute; top: -100%; left: 0; right: 0; height: 60px;
  background: linear-gradient(180deg, transparent, rgba(0,245,255,0.08), transparent);
  animation: scan 2.5s linear infinite paused;
}
@keyframes scan { from { top: -100%; } to { top: 200%; } }

.card-inner { position: relative; padding: 30px 24px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; }
.card-icon  { font-size: 3rem; margin-bottom: 4px; }
.card-name  { font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0; }
.card-desc  { font-size: 0.82rem; color: rgba(255,255,255,0.45); line-height: 1.5; flex: 1; margin: 0; }
.card-cta   { display: flex; align-items: center; gap: 6px; color: #00f5ff; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; margin-top: 4px; }
.cta-arrow  { transition: transform 0.2s; }

/* ── 모달 ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  z-index: 10001;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  position: relative; background: #12122a;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 28px;
  width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto;
  box-shadow: 0 0 60px rgba(0,245,255,0.12), 0 30px 60px rgba(0,0,0,0.6);
}
.modal-close {
  position: absolute; top: 18px; right: 18px;
  background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.5);
  width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; z-index: 10;
  transition: background 0.2s, color 0.2s;
}
.modal-close:hover { background: rgba(255,80,80,0.35); color: #fff; }
.modal-enter-active { transition: opacity 0.3s, transform 0.3s cubic-bezier(.2,.8,.2,1); }
.modal-leave-active { transition: opacity 0.22s, transform 0.18s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.88) translateY(20px); }

/* ── 도구 공통 래퍼 ── */
.game-wrap { padding: 36px 28px 32px; }
.game-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.g-icon { font-size: 2rem; }
.game-title-row h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; }

/* ── 폼 ── */
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.6); }
.tool-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: #e0e0f0; font-size: 0.95rem;
  transition: border-color 0.2s; box-sizing: border-box; font-family: inherit;
}
.tool-input:focus { outline: none; border-color: rgba(0,245,255,0.5); }
.tool-input::placeholder { color: rgba(255,255,255,0.25); }
.tool-input[type="date"] { color-scheme: dark; }

.radio-group  { display: flex; gap: 20px; }
.radio-label  { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: rgba(255,255,255,0.7); cursor: pointer; }
.radio-label input { accent-color: #00f5ff; }
.range-input  { width: 100%; accent-color: #00f5ff; cursor: pointer; }

/* ── 버튼 ── */
.action-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg,#00f5ff,#0071e3); color: #000;
  font-weight: 800; font-size: 1rem; border: none; padding: 14px 32px;
  border-radius: 14px; cursor: pointer; transition: all 0.25s;
  box-shadow: 0 0 20px rgba(0,245,255,0.3); letter-spacing: 0.02em;
  text-decoration: none; font-family: inherit;
}
.action-btn:hover    { transform: translateY(-2px); box-shadow: 0 0 35px rgba(0,245,255,0.5); }
.action-btn:active   { transform: scale(0.97); }
.action-btn:disabled { opacity: 0.5; cursor: default; transform: none !important; box-shadow: none; }
.action-btn.sm       { padding: 10px 22px; font-size: 0.85rem; }

/* ── 결과 박스 ── */
.result-box {
  margin-top: 20px; padding: 20px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
}
.result-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.result-table td { padding: 8px 4px; font-size: 0.88rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.result-table td:first-child { color: rgba(255,255,255,0.55); }
.result-table tr:last-child td { border-bottom: none; }
.val   { text-align: right; font-weight: 700; color: #e0e0f0; }
.minus { color: #ff8080 !important; }

.result-highlight {
  text-align: center; padding: 20px;
  background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.25); border-radius: 14px;
}
.result-label  { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
.result-amount { font-size: 2.2rem; font-weight: 900; color: #00f5ff; }

.result-notice {
  margin-top: 16px; padding: 16px;
  background: rgba(255,200,50,0.08); border: 1px solid rgba(255,200,50,0.3);
  border-radius: 12px; font-size: 0.9rem; color: #ffd93d; text-align: center;
}
.result-notice.error { background: rgba(255,80,80,0.08); border-color: rgba(255,80,80,0.3); color: #ff8080; }
.disclaimer { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 12px; text-align: center; }
.plus { color: #6bcb77 !important; }
.val.net { color: #00f5ff !important; font-size: 1rem; }

/* ── 삼성 성과급 ── */
.tool-intro {
  font-size: 0.85rem; color: rgba(255,255,255,0.55); line-height: 1.6;
  margin: -8px 0 20px; padding: 12px 14px;
  background: rgba(77,150,255,0.07); border: 1px solid rgba(77,150,255,0.18);
  border-radius: 12px;
}
.tool-intro b { color: #8fb8ff; }
.tool-select {
  appearance: none; -webkit-appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2300f5ff' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px;
}
.tool-select option { background: #12122a; color: #e0e0f0; }
.lbl-hint { font-size: 0.72rem; color: rgba(255,255,255,0.35); font-weight: 500; margin-left: 4px; }
.sb-rate-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sb-badge {
  display: inline-block; padding: 6px 14px; border-radius: 999px;
  border: 1px solid; font-size: 0.8rem; font-weight: 800; margin-bottom: 14px;
}
.sb-bars { display: flex; flex-direction: column; gap: 12px; margin: 4px 0 18px; }
.sb-bar-item { display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 10px; }
.sb-bar-label { font-size: 0.78rem; font-weight: 800; color: rgba(255,255,255,0.6); }
.sb-bar-track { height: 12px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
.sb-bar-fill { height: 100%; border-radius: 999px; transition: width 0.7s cubic-bezier(.2,.8,.2,1); }
.sb-bar-fill.opi { background: linear-gradient(90deg,#4d96ff,#00f5ff); }
.sb-bar-fill.tai { background: linear-gradient(90deg,#6bcb77,#a8e063); }
.sb-bar-val { font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.7); white-space: nowrap; }
.sb-highlight { background: linear-gradient(135deg, rgba(77,150,255,0.12), rgba(0,245,255,0.1)); border-color: rgba(0,245,255,0.3); }
.sb-sub { margin-top: 8px; font-size: 0.82rem; color: rgba(255,255,255,0.55); }
.sb-sub b { color: #00f5ff; }

/* ── QR ── */
.qr-result  { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; }
.qr-canvas  { border-radius: 12px; border: 4px solid #fff; }

/* ── 이미지 압축 ── */
.file-drop {
  border: 2px dashed rgba(0,245,255,0.3); border-radius: 14px;
  padding: 30px 20px; text-align: center; cursor: pointer;
  color: rgba(255,255,255,0.4); font-size: 0.9rem;
  transition: border-color 0.2s, background 0.2s;
}
.file-drop:hover { border-color: rgba(0,245,255,0.6); background: rgba(0,245,255,0.04); }
.img-preview-row { display: flex; justify-content: center; margin-top: 12px; }
.img-preview { max-width: 100%; max-height: 200px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }

/* ── 글자수 ── */
.text-area {
  width: 100%; padding: 14px 16px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px; color: #e0e0f0; font-size: 0.9rem; resize: vertical;
  font-family: inherit; transition: border-color 0.2s; box-sizing: border-box;
}
.text-area:focus { outline: none; border-color: rgba(0,245,255,0.5); }
.text-area::placeholder { color: rgba(255,255,255,0.25); }

/* ── D-day ── */
.dday-shortcuts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.dday-detail    { text-align: center; margin-top: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.45); }

/* ── 반응속도 ── */
.reaction-info {
  text-align: center; margin-bottom: 16px;
  font-size: 0.9rem; font-weight: 700; color: rgba(255,255,255,0.55);
}
.reaction-box {
  display: flex; align-items: center; justify-content: center;
  height: 180px; border-radius: 20px; cursor: pointer;
  transition: background 0.2s; user-select: none;
}
.reaction-box.idle     { background: rgba(100,100,130,0.3); border: 2px solid rgba(255,255,255,0.1); }
.reaction-box.waiting  { background: rgba(200,50,50,0.35); border: 2px solid rgba(255,80,80,0.5); }
.reaction-box.early    { background: rgba(255,140,0,0.3); border: 2px solid rgba(255,140,0,0.6); }
.reaction-box.ready    { background: rgba(50,200,80,0.5); border: 2px solid rgba(80,255,100,0.7); animation: ready-pulse 0.4s ease; }
.reaction-box.done     { background: rgba(0,200,255,0.2); border: 2px solid rgba(0,245,255,0.4); }
.reaction-box.finished { background: rgba(162,155,254,0.2); border: 2px solid rgba(162,155,254,0.4); }
@keyframes ready-pulse { 0% { transform: scale(1.04); } 100% { transform: scale(1); } }

.reaction-text    { font-size: 1.2rem; font-weight: 800; color: #fff; text-align: center; padding: 20px; }
.reaction-results { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 12px; }
.reaction-chip    {
  background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3);
  color: #00f5ff; font-size: 0.8rem; font-weight: 700; padding: 4px 12px; border-radius: 20px;
}

/* ── MBTI ── */
.mbti-progress-bar {
  height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-bottom: 6px; overflow: hidden;
}
.mbti-progress-fill {
  height: 100%; background: linear-gradient(90deg, #00f5ff, #a29bfe);
  border-radius: 3px; transition: width 0.4s ease;
}
.mbti-progress-text { font-size: 0.8rem; color: rgba(255,255,255,0.35); text-align: right; margin-bottom: 24px; }
.mbti-question      { font-size: 1.15rem; font-weight: 700; color: #fff; text-align: center; margin-bottom: 24px; line-height: 1.5; }
.mbti-answers       { display: flex; flex-direction: column; gap: 12px; }
.mbti-answer-btn {
  padding: 16px 20px; border-radius: 14px; text-align: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8); font-size: 0.95rem; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
}
.mbti-answer-btn:hover {
  background: rgba(0,245,255,0.1); border-color: rgba(0,245,255,0.4); color: #fff;
  transform: translateY(-2px);
}

.mbti-result   { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.mbti-type-card {
  width: 100%; padding: 28px 24px; border-radius: 20px; text-align: center;
  background: rgba(255,255,255,0.04); border: 2px solid;
}
.mbti-type-emoji { font-size: 3.5rem; margin-bottom: 8px; }
.mbti-type-code  { font-size: 2.5rem; font-weight: 900; margin-bottom: 6px; }
.mbti-type-name  { font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 12px; }
.mbti-type-desc  { font-size: 0.88rem; color: rgba(255,255,255,0.5); line-height: 1.6; }
.mbti-btn-row    { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

/* ── 운세 ── */
.fortune-zodiac {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 18px; padding-bottom: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.fortune-zodiac-emoji { font-size: 2.4rem; }
.fortune-zodiac-name  { font-size: 1.3rem; font-weight: 800; color: #fff; flex: 1; }
.fortune-date         { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
.fortune-items        { display: flex; flex-direction: column; gap: 12px; }
.fortune-item {
  padding: 12px 14px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;
}
.fortune-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.fortune-item-label  { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.7); }
.fortune-stars       { font-size: 0.85rem; letter-spacing: 2px; }
.fortune-item-msg    { font-size: 0.83rem; color: rgba(255,255,255,0.5); line-height: 1.5; }

/* ── 반응형 ── */
@media (max-width: 600px) {
  .tools-grid      { grid-template-columns: repeat(2, 1fr); }
  .game-wrap       { padding: 28px 18px 24px; }
  .result-amount   { font-size: 1.6rem; }
  .mbti-question   { font-size: 1rem; }
  .mbti-answer-btn { font-size: 0.88rem; padding: 14px 16px; }
  .dday-shortcuts  { justify-content: center; }
  .sb-rate-row     { grid-template-columns: 1fr; gap: 0; }
}
@media (max-width: 380px) {
  .tools-grid { grid-template-columns: 1fr; }
}
</style>
