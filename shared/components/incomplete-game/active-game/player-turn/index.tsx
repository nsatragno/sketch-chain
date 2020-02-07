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
import { h, Component } from 'preact';
import { Game, Player } from 'shared/types';
import FirstRound from './first-round';
import DrawingRound from './drawing-round';
import DescribeRound from './describe-round';

interface Props {
  game: Game;
  players: Player[];
  userPlayer: Player;
}

interface State {
  submitting: boolean;
}

export default class PlayerTurn extends Component<Props, State> {
  state: State = {
    submitting: false,
  };

  private _onTurnSubmit = async (turnData: string) => {
    this.setState({ submitting: true });
    const response = await fetch('play?json=1', {
      method: 'POST',
      body: new URLSearchParams({ turn: turnData }),
    });
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
    }
    this.setState({ submitting: false });
  };

  render({ game, userPlayer, players }: Props, { submitting }: State) {
    const previousPlayer: Player | undefined = players[userPlayer.order! - 1];
    const nextPlayer: Player | undefined = players[userPlayer.order! + 1];

    return (
      <div>
        {!previousPlayer ? (
          <FirstRound
            onSubmit={this._onTurnSubmit}
            nextPlayer={nextPlayer}
            submitting={submitting}
          />
        ) : userPlayer.order! % 2 ? (
          <DrawingRound
            onSubmit={this._onTurnSubmit}
            previousPlayer={previousPlayer}
            submitting={submitting}
          />
        ) : (
          <DescribeRound
            onSubmit={this._onTurnSubmit}
            previousPlayer={previousPlayer}
            submitting={submitting}
          />
        )}
      </div>
    );
  }
}