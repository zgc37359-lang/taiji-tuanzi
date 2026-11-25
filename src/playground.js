const images = ["pets/spritesheet-v2.png", "assets/classic.webp"].map(source => {
    const image = new Image();
    image.src = source;
    return image;
  });
  const verticalSprites = new Image();
  verticalSprites.src = "assets/vertical-poses.webp";
  const canvas = document.getElementById("arena");
  const ctx = canvas.getContext("2d");
  const status = document.getElementById("state");
  const compare = document.getElementById("compare");
  const progress = document.getElementById("progress");
  const prompt = document.getElementById("prompt");
  const practice = document.getElementById("practice");
  const buttons = [...document.querySelectorAll("[data-row]")];
  const specialButtons = [...document.querySelectorAll("[data-special]")];
  const tempos = [
    [240,165,165,165,165,230], [105,105,105,105,105,105,105,105],
    [105,105,105,105,105,105,105,105], [145,240,230,210], [140,115,125,120,155],
    [130,130,135,145,145,155,165,245], [165,140,145,200,180,210],
    [150,140,155,140,155,170], [160,145,155,180,185,230]
  ];
  const names = ["待机","向右跑","向左跑","招呼","轻跳","失手","等待","推掌","复核"];
  const steps = [3,1,2,4,7];
  const instructions = ["点击团子或选择「招呼」。","按 → 或选择「右移」。","按 ← 或选择「左移」。","按空格或选择「轻跳」。","选择「推掌」，完成收势。"];
  const held = new Set();
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cell = { width:192,height:208 };
  const renderScale = 1.32;
  const groundedY = 73;
  const groundLine = 343;
  const dragThreshold = 26;
  const moves = {
    fly: { label:"一飞冲天", duration:1200, exitAt:485, returnAt:680, groundedAt:1100, row:0, exitY:-290 },
    burrow: { label:"遁地", duration:1120, exitAt:390, returnAt:590, groundedAt:1000, row:1, exitY:365 }
  };
  let edition = 0;
  let action = 0;
  let actionStart = 0;
  let stopAt = Infinity;
  let moveUntil = 0;
  let x = canvas.width / 2;
  let pointer = null;
  let lastTime = 0;
  let lastStatus = "";
  let step = -1;
  let focusUntil = 0;
  let drag = null;
  let verticalMove = null;

  function setPracticeStep(newStep) {
    step = newStep;
    progress.value = step < 0 ? 0 : step;
    if (step === steps.length) {
      prompt.textContent = "跟练完成。团子已经准备好再练一套。";
      practice.textContent = "再练一套";
    } else {
      prompt.textContent = `第 ${step + 1} 步／${steps.length}　${instructions[step]}`;
      practice.textContent = "重新开始";
    }
  }

  function play(row, move = false, keep = false) {
    if (verticalMove) return;
    const now = performance.now();
    if (row === steps[step]) setPracticeStep(step + 1);
    if (row !== action || !keep) {
      action = row;
      actionStart = now;
    }
    const length = tempos[row].reduce((a,b) => a+b,0);
    stopAt = row === 0 || keep ? Infinity : now + length;
    moveUntil = move ? now + length : 0;
    focusUntil = now + 320;
    buttons.forEach(button => button.setAttribute("aria-pressed", Number(button.dataset.row) === row));
  }

  function startVertical(kind) {
    if (verticalMove || !verticalSprites.complete || !verticalSprites.naturalWidth) return;
    const now = performance.now();
    verticalMove = { ...moves[kind], kind, start:now };
    held.clear();
    moveUntil = 0;
    buttons.forEach(button => button.setAttribute("aria-pressed", false));
    specialButtons.forEach(button => button.setAttribute("aria-pressed", button.dataset.special === kind));
  }

  function verticalPose(move, elapsed) {
    const liftStart = 110;
    if (elapsed < liftStart) return { y:groundedY, col:elapsed < 35 ? 0 : 1 };
    if (elapsed < move.exitAt) {
      const progress = (elapsed - liftStart) / (move.exitAt - liftStart);
      const y = groundedY + (move.exitY - groundedY) * progress ** (move.kind === "fly" ? 1.75 : 1.35);
      return { y, col:progress < .38 ? 2 : progress < .75 ? 3 : 4 };
    }
    if (elapsed < move.returnAt) return { y:move.exitY, col:4 };
    if (elapsed < move.groundedAt) {
      const progress = (elapsed - move.returnAt) / (move.groundedAt - move.returnAt);
      const easing = 1 - (1 - progress) ** 2;
      return { y:move.exitY + (groundedY - move.exitY) * easing, col:progress < .68 ? 4 : 5 };
    }
    return { y:groundedY, col:5 };
  }

  function setStatus(label) {
    if (lastStatus !== label) { status.textContent = label; lastStatus = label; }
  }

  function drawPose(sheet, row, column, y, scale = renderScale) {
    const anchoredY = y + (renderScale - scale) * 203;
    ctx.drawImage(sheet,column*cell.width,row*cell.height,cell.width,cell.height,
      Math.round(x-cell.width*scale/2),Math.round(anchoredY),cell.width*scale,cell.height*scale);
  }

  function focusDirection() {
    if (!pointer) return null;
    const dx = pointer.x - (x + 13);
    const dy = pointer.y - 162;
    if (Math.hypot(dx,dy) < 37) return null;
    const clockwise = (Math.atan2(dx,-dy) + 2*Math.PI) % (2*Math.PI);
    return Math.round(clockwise / (Math.PI / 8)) % 16;
  }

  function heldRow() {
    const latest = [...held].at(-1);
    return latest === "ArrowRight" ? 1 : latest === "ArrowLeft" ? 2 : 0;
  }

  function paintStage(pose) {
    const background = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    background.addColorStop(0,"#173e37");
    background.addColorStop(1,"#4b7662");
    ctx.fillStyle = background;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "#e4d8ae55";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(330,345,278,58,0,0,2*Math.PI);
    ctx.ellipse(330,345,244,43,0,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(330,153,81,0,2*Math.PI);
    ctx.strokeStyle = "#e4d8ae42";
    ctx.stroke();
    const altitude = pose ? Math.max(0,groundedY - pose.y) : 0;
    const groundShadowSize = Math.max(24,82 - altitude*.18);
    ctx.fillStyle = "#142d286e";
    ctx.beginPath();
    ctx.ellipse(x,340,groundShadowSize,11,0,0,2*Math.PI);
    ctx.fill();
    if (verticalMove?.kind === "burrow" && pose.y > groundedY) {
      const width = Math.min(105,35+(pose.y-groundedY)*.85);
      ctx.fillStyle = "#132d27";
      ctx.strokeStyle = "#ecd89999";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x,groundLine,width,14,0,0,2*Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }

  function animate(now) {
    const dt = Math.min(0.045,(now - lastTime)/1000);
    lastTime = now;
    if (verticalMove && now - verticalMove.start >= verticalMove.duration) {
      verticalMove = null;
      specialButtons.forEach(button => button.setAttribute("aria-pressed", false));
      play(0);
    }
    if (verticalMove) {
      const pose = verticalPose(verticalMove, now - verticalMove.start);
      paintStage(pose);
      ctx.save();
      if (verticalMove.kind === "burrow") {
        ctx.beginPath();
        ctx.rect(0,0,canvas.width,groundLine);
        ctx.clip();
      }
      drawPose(verticalSprites,verticalMove.row,pose.col,pose.y,
        verticalMove.kind === "fly" ? renderScale*1.16 : renderScale);
      ctx.restore();
      setStatus(verticalMove.label);
      requestAnimationFrame(animate);
      return;
    }
    const heldAction = heldRow();
    const isMoving = now < moveUntil || action === heldAction;
    const direction = isMoving ? (action === 1 ? 1 : action === 2 ? -1 : 0) : 0;
    x = Math.max(132,Math.min(528,x + dt * 168 * direction));
    if (now >= stopAt) play(heldAction,false,Boolean(heldAction));
    const timings = tempos[action];
    const duration = timings.reduce((a,b) => a+b,0);
    let offset = Math.max(0, now - actionStart) % duration;
    let column = 0;
    while (offset >= timings[column] && column < timings.length-1) offset -= timings[column++];
    const gaze = action === 0 && now > focusUntil ? focusDirection() : null;
    const row = gaze === null ? action : 9 + Math.floor(gaze/8);
    const frame = gaze === null ? (prefersReducedMotion && action === 0 ? 0 : column) : gaze % 8;
    paintStage();
    const sprite = images[edition];
    if (sprite.complete && sprite.naturalWidth) {
      drawPose(sprite,row,frame,groundedY);
      setStatus(gaze === null ? names[action] : "视线跟随");
    }
    requestAnimationFrame(animate);
  }

  function canvasPoint(event) {
    const box = canvas.getBoundingClientRect();
    return { x:(event.clientX-box.left)*canvas.width/box.width, y:(event.clientY-box.top)*canvas.height/box.height };
  }

  canvas.addEventListener("pointerdown", event => {
    if (event.button !== 0 || drag || verticalMove) return;
    const start = canvasPoint(event);
    canvas.focus({ preventScroll:true });
    canvas.setPointerCapture(event.pointerId);
    drag = { id:event.pointerId, start, lastX:start.x, stageX:x, axis:null };
  });
  canvas.addEventListener("pointermove", event => {
    pointer = canvasPoint(event);
    if (!drag || drag.id !== event.pointerId || drag.axis === "vertical") return;
    const dx = pointer.x - drag.start.x;
    const dy = pointer.y - drag.start.y;
    if (!drag.axis) {
      if (Math.max(Math.abs(dx),Math.abs(dy)) < dragThreshold) return;
      drag.axis = Math.abs(dy) > 1.1 * Math.abs(dx) ? "vertical" : "horizontal";
      if (drag.axis === "vertical") {
        startVertical(dy < 0 ? "fly" : "burrow");
        return;
      }
      held.clear();
    }
    const delta = pointer.x - drag.lastX;
    if (Math.abs(delta) >= 1) play(delta > 0 ? 1 : 2,false,true);
    drag.lastX = pointer.x;
    x = Math.max(132,Math.min(528,drag.stageX+dx));
  });
  function finishDrag(event, cancelled = false) {
    if (!drag || drag.id !== event.pointerId) return;
    const { axis } = drag;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (axis === "horizontal") play(0);
    if (!axis && !cancelled) play(3);
  }
  canvas.addEventListener("pointerup", finishDrag);
  canvas.addEventListener("pointercancel", event => finishDrag(event,true));
  canvas.addEventListener("lostpointercapture", event => finishDrag(event,true));
  canvas.addEventListener("pointerleave", () => { pointer = null; });
  buttons.forEach(button => button.addEventListener("click", () => {
    const row = Number(button.dataset.row);
    play(row,row === 1 || row === 2);
  }));
  specialButtons.forEach(button => button.addEventListener("click", () => startVertical(button.dataset.special)));
  compare.addEventListener("click", () => {
    edition = 1-edition;
    compare.textContent = edition ? "切换到加强版" : "切换到初版";
    compare.setAttribute("aria-pressed", Boolean(edition));
  });
  practice.addEventListener("click", () => setPracticeStep(0));
  canvas.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!["ArrowRight","ArrowLeft","ArrowUp","ArrowDown","Space","Enter"].includes(event.code)) return;
    event.preventDefault();
    if (event.repeat || drag || verticalMove) return;
    if (event.code === "Space") {play(4);return;}
    if (event.code === "Enter") {play(3);return;}
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      startVertical(event.code === "ArrowUp" ? "fly" : "burrow");
      return;
    }
    held.add(event.code);
    play(event.code === "ArrowRight" ? 1 : 2,false,true);
  });
  canvas.addEventListener("keyup", event => {
    if (!held.delete(event.code)) return;
    if (action === 1 || action === 2) {
      const current = heldRow();
      play(current,false,Boolean(current));
    }
  });
  function releaseMovement() {
    held.clear();
    if (action === 1 || action === 2) play(0);
  }
  canvas.addEventListener("blur", releaseMovement);
  addEventListener("blur", releaseMovement);
  play(0);
  requestAnimationFrame(animate);
