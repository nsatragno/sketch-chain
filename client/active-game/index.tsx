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
import { h, render, Component } from 'preact';

import WS from 'client/ws';
import IncompleteGame from 'shared/components/incomplete-game';
import { GameState, GamePageData } from 'shared/types';

const loginInfo = document.querySelector('.login-info');
const userId = loginInfo
  ? (loginInfo as HTMLElement).dataset.userId!
  : undefined;

let updateListener: ((message: GamePageData) => void) | undefined;
const setUpdateListener = (callback: (message: GamePageData) => void) =>
  (updateListener = callback);

class ClientComponent extends Component<GamePageData, GamePageData> {
  state: GamePageData = { ...this.props };

  constructor(props: GamePageData) {
    super(props);
    setUpdateListener((data: GamePageData) => {
      this.setState(data);
    });
  }

  render(
    _: GamePageData,
    { game, inPlayThread, lastTurnInThread }: GamePageData,
  ) {
    return (
      <IncompleteGame
        userId={userId}
        game={game}
        inPlayThread={inPlayThread}
        lastTurnInThread={lastTurnInThread}
      />
    );
  }
}

const gameEl = document.querySelector('.game')!;

new WS('ws', (message) => {
  const data = JSON.parse(message);
  if (data.cancelled) {
    // TODO: maybe do something more informative?
    location.href = '/';
    return;
  }

  if ((data as GamePageData).game.state === GameState.Complete) {
    location.reload();
    return;
  }

  // If this isn't our first update, just call the callback.
  // ClientComponent will handle the rest.
  if (updateListener) {
    updateListener(data);
    return;
  }

  // This is only called once, for the first render.
  render(<ClientComponent {...(data as GamePageData)} />, gameEl);
});
