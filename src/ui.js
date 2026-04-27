import { dimensions, questions } from "./data/questions.js";

function renderOptions(question, selectedAnswer) {
  return Object.entries(question.options)
    .map(([code, text]) => {
      const active = selectedAnswer === code ? "is-active" : "";
      return `
        <button class="option-card ${active}" data-action="answer" data-value="${code}">
          <span class="option-code">${code}</span>
          <span>${text}</span>
        </button>
      `;
    })
    .join("");
}

function renderPersonaTags(tags) {
  return tags.map((tag) => `<span>${tag}</span>`).join("");
}

function renderRadarRows(rawScores) {
  return dimensions
    .map((dimension) => {
      const value = rawScores[dimension.key];
      return `
        <div class="radar-row">
          <span>${dimension.key} · ${dimension.label}</span>
          <div class="radar-bar"><i style="width:${(value / 6) * 100}%"></i></div>
          <strong>${value}/6</strong>
        </div>
      `;
    })
    .join("");
}

function pendingNotes(config) {
  return `
    <div class="pending-panel">
      <p>${config.pendingNotes.bridge}</p>
      <p>${config.pendingNotes.api}</p>
    </div>
  `;
}

export function renderApp(state) {
  const { screen, activityConfig, auth, quiz, result, poster, ui, latestResult } = state;
  const currentQuestion = questions[quiz.currentQuestionIndex] || questions[0];
  const progress = Math.round((quiz.answers.filter(Boolean).length / questions.length) * 100);
  const resultData = result.computedResult || latestResult?.latestResult;
  const persona = resultData?.persona;

  return `
    <div class="app-shell">
      <div class="device-shell">
        ${screen === "landing" ? renderLanding(state) : ""}
        ${screen === "resume" ? renderResume(state) : ""}
        ${screen === "quiz" ? renderQuiz(currentQuestion, quiz, progress) : ""}
        ${screen === "calculating" ? renderCalculating(result.pendingPreview) : ""}
        ${screen === "result" ? renderResult(state, resultData, persona) : ""}
        ${screen === "poster" ? renderPosterState(state, resultData) : ""}
        ${screen === "activity_unavailable" ? renderUnavailable(activityConfig) : ""}
        ${screen === "network_error" ? renderError(ui.networkMessage || "网络开了小差，点击重试") : ""}
      </div>
      ${poster.previewUrl ? `<section class="poster-preview"><img src="${poster.previewUrl}" alt="poster preview" /></section>` : ""}
    </div>
  `;

  function renderLanding(currentState) {
    const hasLatestResult = Boolean(currentState.latestResult?.hasResult && currentState.latestResult.latestResult);
    const heroResult = hasLatestResult ? currentState.latestResult.latestResult.personalityName : "16 型人格";
    return `
      <section class="screen screen-landing">
        <div class="world world-landing"></div>
        <header class="hero">
          <div class="brand">zhibo8</div>
          <div class="hero-kv">
            <div class="hero-copy">
              <p class="eyebrow">2026 世界杯特别企划</p>
              <h1>世界杯球迷人格大鉴赏</h1>
              <p class="slogan">${activityConfig.slogan}</p>
            </div>
            <div class="hero-scoreboard">
              <strong>${heroResult}</strong>
              <span>${hasLatestResult ? "你上次的结果仍可直接查看" : "16 道题 / 3 分钟 / 16 型人格"}</span>
            </div>
          </div>
          <article class="card intro-card">
            <div class="stats-row">
              <div><strong>16</strong><span>题</span></div>
              <div><strong>3</strong><span>分钟</span></div>
              <div><strong>8</strong><span>维建模</span></div>
            </div>
            <p>${activityConfig.summary}</p>
          </article>
          <article class="card detail-card">
            <h2>你会拿到什么</h2>
            <ul>
              <li>首屏人格认领 + 下滑完整档案</li>
              <li>八维雷达、球星对照、拍档与天敌</li>
              <li>海报态、分享态、异常态完整演示</li>
            </ul>
          </article>
          ${pendingNotes(activityConfig)}
        </header>
        <footer class="bottom-bar">
          ${hasLatestResult ? '<button class="secondary-btn" data-action="open-latest-result">查看我的结果</button>' : ""}
          <button class="primary-btn" data-action="start-quiz">${hasLatestResult ? "重新测试" : "开始鉴赏"}</button>
        </footer>
      </section>
    `;
  }

  function renderResume(currentState) {
    return `
      <section class="screen screen-modal">
        <div class="modal-card">
          <p class="eyebrow">检测到未完成测试</p>
          <h2>继续上次进度？</h2>
          <p>24 小时内的答题草稿已恢复。你可以继续作答，或清空后重新开始。</p>
          <div class="modal-actions">
            <button class="secondary-btn" data-action="restart-quiz">重新开始</button>
            <button class="primary-btn" data-action="resume-quiz">继续作答</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderQuiz(question, currentQuiz, currentProgress) {
    return `
      <section class="screen screen-quiz">
        <div class="world world-quiz"></div>
        <header class="topbar">
          <button class="icon-btn" data-action="back-question">‹</button>
          <div class="brand-pill">WFTI</div>
          <button class="ghost-link" data-action="go-landing">退出</button>
        </header>
        <section class="progress-panel">
          <div class="progress-meta">
            <span>${question.dimension} · ${dimensions.find((item) => item.key === question.dimension)?.label || ""}</span>
            <strong>${currentProgress}% · ${currentQuiz.currentQuestionIndex + 1}/16</strong>
          </div>
          <div class="progress-track"><i style="width:${currentProgress}%"></i></div>
        </section>
        <article class="card question-card">
          <p class="eyebrow">第 ${question.id} 题</p>
          <h2>${question.title}</h2>
          <p>单题选择后自动切题，支持回退，24 小时内可续答。</p>
        </article>
        <section class="options-panel">
          ${renderOptions(question, currentQuiz.answers[currentQuiz.currentQuestionIndex])}
        </section>
        <div class="helper-row">
          <span>支持回退修改</span>
          <span>本地草稿 24h</span>
          <span>关键埋点已接入位</span>
        </div>
      </section>
    `;
  }

  function renderCalculating(preview) {
    return `
      <section class="screen screen-calculating">
        <div class="world world-calculating"></div>
        <div class="scan-core"></div>
        <p class="eyebrow">结果生成中</p>
        <h2>正在分析你的球迷 DNA……</h2>
        <p>${preview ? `${preview.personalityName} 轮廓已出现，仪式感保留到 2.5 秒完成。` : "系统正在完成 8 维评分与人格匹配。"}</p>
      </section>
    `;
  }

  function renderResult(currentState, currentResult, currentPersona) {
    if (!currentResult || !currentPersona) {
      return renderError("结果暂不可用，请重试");
    }
    return `
      <section class="screen screen-result">
        <div class="world world-result"></div>
        <div class="result-scroll">
          <header class="result-hero">
            <div class="brand">zhibo8</div>
            <p class="eyebrow">${currentResult.isHidden ? "隐藏人格" : "人格档案"}</p>
            <h1>${currentResult.personalityCode}</h1>
            <h2>${currentResult.personalityName}</h2>
            <p class="lead">${currentPersona.oneLiner}</p>
            <div class="tag-cloud">${renderPersonaTags(currentPersona.tags)}</div>
            <div class="hero-hint"><span>下滑查看完整人格档案</span></div>
          </header>

          <article class="card section-card">
            <h3>人格速览</h3>
            <p>${currentPersona.description}</p>
            <div class="quick-grid">
              <div><strong>球星对照</strong><span>${currentPersona.star}</span></div>
              <div><strong>最佳拍档</strong><span>${currentPersona.partner}</span></div>
              <div><strong>天敌属性</strong><span>${currentPersona.rival}</span></div>
            </div>
          </article>

          <article class="card section-card">
            <h3>八维雷达</h3>
            <div class="radar-rows">${renderRadarRows(currentResult.rawScores)}</div>
          </article>

          <article class="card section-card">
            <h3>对接状态</h3>
            <p>${activityConfig.pendingNotes.bridge}</p>
            <p>${activityConfig.pendingNotes.api}</p>
            <p>结果写入状态：${result.saveStatus}</p>
          </article>

          <article class="card qr-card">
            <h3>扫码查看完整人格档案</h3>
            <div class="qr-shell">
              <div class="qr-placeholder">${currentResult.personalityCode}</div>
              <div>
                <strong>分享海报态已接入</strong>
                <p>${currentState.qrConfig?.link || activityConfig.qrLandingUrl}</p>
                <p>【待接口确认】当前使用 mock 链接与本地二维码占位。</p>
              </div>
            </div>
          </article>
        </div>
        <footer class="bottom-bar result-bar">
          <button class="secondary-btn" data-action="save-poster">保存相册</button>
          <button class="primary-btn" data-action="share-result">分享名片</button>
          <button class="text-btn" data-action="restart-quiz">重新预测</button>
        </footer>
      </section>
    `;
  }

  function renderPosterState(currentState, currentResult) {
    return `
      <section class="screen screen-poster">
        <div class="modal-card">
          <p class="eyebrow">海报态</p>
          <h2>${poster.generating ? "海报生成中…" : "海报已生成"}</h2>
          <p>
            ${poster.generating
              ? "正在绘制独立海报画布，超过 5 秒会自动失败回退。"
              : currentResult
                ? `${currentResult.personalityName} 海报已准备好，可保存或分享。`
                : "等待结果数据。"}
          </p>
          <div class="modal-actions">
            <button class="secondary-btn" data-action="close-poster">返回结果</button>
            <button class="primary-btn" data-action="save-poster-direct">下载海报</button>
          </div>
          ${poster.error ? `<p class="error-copy">${poster.error}</p>` : ""}
        </div>
      </section>
    `;
  }

  function renderUnavailable(config) {
    return `
      <section class="screen screen-status">
        <div class="card status-card">
          <p class="eyebrow">活动状态</p>
          <h2>${config.activityStatus === "upcoming" ? "活动即将开始" : "活动已结束"}</h2>
          <p>
            ${config.activityStatus === "upcoming"
              ? "世界杯球迷人格鉴赏即将开场。活动开启后，你会第一时间收到入场提醒。"
              : "感谢参与。本届最热门的三种球迷人格仍在站内持续刷屏。"}
          </p>
          <div class="top3-list">
            <span>GOAT 绿茵教父</span>
            <span>RIOT 易燃易爆</span>
            <span>VIBE 气氛组担当</span>
          </div>
          <button class="primary-btn" data-action="retry-bootstrap">重新加载</button>
        </div>
      </section>
    `;
  }

  function renderError(message) {
    return `
      <section class="screen screen-status">
        <div class="card status-card">
          <p class="eyebrow">异常态</p>
          <h2>网络开了小差</h2>
          <p>${message}</p>
          <button class="primary-btn" data-action="retry-bootstrap">重新加载</button>
        </div>
      </section>
    `;
  }
}
