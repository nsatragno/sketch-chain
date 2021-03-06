/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { base64ToBuffer } from 'shared/utils/base64';
import { resetCanvas, drawPathData } from 'shared/utils/drawing-canvas';
import { getIsEnabled as getNotificationEnabled } from 'shared/utils/notificaiton-state';

const containers = document.querySelectorAll(
  '.final-drawing-canvas-container',
) as NodeListOf<HTMLCanvasElement>;
const completeGame = document.querySelector('.complete-game') as HTMLElement;

for (const container of containers) {
  const canvas = container.querySelector('canvas') as HTMLCanvasElement;
  const { width, height } = canvas;
  const pathBase64 = container.dataset.path!;
  const points = new Uint16Array(base64ToBuffer(pathBase64));
  const ctx = canvas.getContext('2d')!;
  resetCanvas(ctx, width, height);
  drawPathData(width, height, points, ctx);
}

if (!document.hasFocus() && getNotificationEnabled()) {
  const gameId = completeGame.dataset.gameId;

  const notification = new Notification('Sketch Chain', {
    body: `Game complete! See the results for ${gameId}`,
    tag: gameId,
  });

  notification.addEventListener('click', () => {
    window.focus();
    notification.close();
  });
}
