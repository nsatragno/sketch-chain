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
import { Game, Player, Thread, Turn } from 'shared/types';
import ChangeParticipation from '../change-participation';
import PlayerTurn from './player-turn';

interface Props {
  userPlayer?: Player;
  game: Game;
  inPlayThread: Thread | null;
  lastTurnInThread: Turn | null;
}

interface State {
  removing: boolean;
}

export default class ActiveGame extends Component<Props, State> {
  state: State = {
    removing: false,
  };

  private _onRemoveSubmit = async (event: Event) => {
    event.preventDefault();

    if (!confirm('Remove player from game?')) return;

    this.setState({ removing: true });
    const form = event.target as HTMLFormElement;
    const formDataEntries = [...new FormData(form)] as Array<[string, string]>;
    const body = new URLSearchParams(formDataEntries);
    const response = await fetch('leave?json=1', { method: 'POST', body });
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
    }
    this.setState({ removing: false });
  };

  componentDidUpdate(previousProps: Props) {
    // If we're displaying a new round, reset the scroll position
    if (
      this.props.lastTurnInThread?.id !== previousProps.lastTurnInThread?.id
    ) {
      window.scrollTo(0, 0);
    }
  }

  render(
    { userPlayer, game, inPlayThread, lastTurnInThread }: Props,
    { removing }: State,
  ) {
    return (
      <div>
        {inPlayThread ? (
          <PlayerTurn
            // Make sure the component changes for the new turn
            key={lastTurnInThread ? lastTurnInThread.id : inPlayThread.id}
            players={game.players!}
            thread={inPlayThread}
            previousTurn={lastTurnInThread}
          />
        ) : (
          <div class="content-box content-sized">
            <h2 class="content-box-title">Waiting</h2>
            <div class="content-padding">
              <p>Waiting on others to take their turn…</p>
            </div>
          </div>
        )}
        <div class="content-box content-sized">
          <h2 class="content-box-title">Game state</h2>
          <div class="content-padding">
            <ol class="player-list">
              {game.players!.map((player) => (
                <li key={player.userId}>
                  {player.avatar && (
                    <img
                      width="40"
                      height="40"
                      alt=""
                      class="avatar"
                      src={`${player.avatar}=s${40}-c`}
                      srcset={`${player.avatar}=s${80}-c 2x`}
                    />
                  )}
                  <div class="name">
                    {player.name} {player.leftGame && '(left game)'}
                  </div>
                  <div class="player-round-status">
                    {game.threads!.map((thread) => {
                      const normalisedTurn =
                        player.order! < thread.turnOffset
                          ? player.order! -
                            thread.turnOffset +
                            game.players!.length
                          : player.order! - thread.turnOffset;

                      return (
                        <div
                          class={`player-round-status-item ${
                            thread.complete || thread.turn > normalisedTurn!
                              ? 'status-complete'
                              : thread.turn === normalisedTurn!
                              ? 'status-active'
                              : 'status-pending'
                          }`}
                        ></div>
                      );
                    })}
                  </div>
                  {userPlayer?.isAdmin && !player.isAdmin && (
                    <div class="remove">
                      <form
                        action="leave"
                        method="POST"
                        onSubmit={this._onRemoveSubmit}
                      >
                        <input
                          type="hidden"
                          name="player"
                          value={player.userId}
                          disabled={removing}
                        />
                        <button class="button button-bad" disabled={removing}>
                          Remove
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div class="hero-button-container">
          <ChangeParticipation
            userPlayer={userPlayer}
            game={game}
            warnOnLeave
          />
        </div>
      </div>
    );
  }
}
