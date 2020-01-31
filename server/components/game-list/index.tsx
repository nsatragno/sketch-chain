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
import { h, FunctionalComponent } from 'preact';
import { GameState } from 'shared/types';
import { UserGames } from 'server/data';

interface Props {
  userGames: UserGames[];
}

const GameList: FunctionalComponent<Props> = ({ userGames }) => {
  return (
    <ul>
      {userGames.map(userGame => (
        <li>
          <a href={`/game/${userGame.game.id}/`}>
            {userGame.game.id} -{' '}
            {userGame.game.state === GameState.Open
              ? 'Waiting for players'
              : userGame.waitingOnPlayer
              ? 'Waiting on you!'
              : userGame.game.state === GameState.Playing
              ? 'Waiting on others'
              : 'Complete'}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default GameList;
