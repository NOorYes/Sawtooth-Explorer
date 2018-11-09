/**
 * Copyright 2017 PokitDok, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ------------------------------------------------------------------------------
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Base64 } from '@types/js-base64'; // 디코더 

/**
 * Used to decode base64 data within templates.
 */
@Pipe({
  name: 'base64decode'
})
export class Base64DecodePipe implements PipeTransform {

  public static BASE64_REGEX_STR = '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$'; // 정규식
 // /[^A-Za-z0-9\+\/\=]/g
 // g는 global의 약자로, 정규표현식과 일치하는 모든 내용을 찾아오라는 옵션입니다.
 // 정규식 문제는 아닌게, 애초에 처음 인코딩 된거에는 한글이 없음. 이걸로 거르고 나온 걸 표시하는 과정에서 문제가 생긴것  

  /**
   * Transforms the value passed from base64 to a plain text string. ase64에서 전달 된 값을 일반 텍스트 문자열로 변환합니다.
   * @param value {any} - value to be transformed from base64, base64에서 변환 할 값입니다.
   * @param args {any} - any additional information for the pipe, 파이프에 대한 추가 정보.
   * @returns {string} - value as a readable string, 읽을 수있는 문자열로서의 값.
   */
  transform(value: any, args?: any): any {
    if (!value) return value; // 밸류가 없으면 밸류를 리턴합니다. 

    let base64Regex = new RegExp(Base64DecodePipe.BASE64_REGEX_STR); // 위의 정규식을 때려박습니다. 
    let decodedValue = value; // 디코딩할 문자를 지정합니다. 

    // attempt to decode from base64 if needed
    if (base64Regex.test(value)) { // 패턴이 있는지를 봄. 즉 base64로 인코딩된 문자인지를 탐지하는 것. 
      try {
        // decodedValue = atob(value); // atob : base64 디코딩 메소드 
        decodedValue = Base64.decode(value);
      } catch(e) {
      }
    }

    console.log(decodedValue); // 테스트용

    return decodedValue; // 여기서 리턴하는데, 
  }
}
