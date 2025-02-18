/*
 *    Copyright 2022 CROZ d.o.o, the original author or authors.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import { FormConfigurationValidationConverter } from "../../src/converter/FormConfigurationValidationConverter";
import {
  createComplexValidationList, createCustomValidationList, createNestedValidationList, createSimpleValidationList, invalidValidationConfiguration,
} from "../testutil/form-configuration-generating-util";

describe("@nrich/form-configuration-core/FormConfigurationValidationConverter", () => {
  it("should not throw exception when receiving invalid configuration", () => {
    // given
    const converter = new FormConfigurationValidationConverter();
    const invalidValidationConfigurationList = invalidValidationConfiguration();

    // when
    const result = converter.convertFormConfigurationToYupSchema(invalidValidationConfigurationList);

    // then
    expect(result).toBeDefined();
    expect(result.isValidSync({ username: "username" })).toBe(true);
  });

  it("should convert simple configuration to yup schema", () => {
    // given
    const converter = new FormConfigurationValidationConverter();
    const simpleValidationList = createSimpleValidationList();

    // when
    const result = converter.convertFormConfigurationToYupSchema(simpleValidationList);

    // then
    expect(result).toBeDefined();
    expect(() => result.validateSync({ username: "" })).toThrowError("Username cannot be blank");
    expect(result.isValidSync({ username: "username" })).toBe(true);
  });

  it("should use custom converter", () => {
    // given
    const additionalConverter = {
      supports: (_) => true,
      convert: (configuration, validator) => validator.required("Custom validation error"),
    };
    const converter = new FormConfigurationValidationConverter([additionalConverter]);
    const simpleValidationList = createSimpleValidationList();

    // when
    const result = converter.convertFormConfigurationToYupSchema(simpleValidationList);

    // then
    expect(result).toBeDefined();
    expect(() => result.validateSync({ username: "" })).toThrowError("Custom validation error");
  });

  it("should convert complex configuration to yup schema", () => {
    // given
    const converter = new FormConfigurationValidationConverter();
    const complexValidationList = createComplexValidationList();

    // when
    const result = converter.convertFormConfigurationToYupSchema(complexValidationList);

    // then
    expect(result).toBeDefined();
    expect(() => result.validateSync({ name: "D" })).toThrowError("Name must have minimum 3 and maximum 10 characters");
    expect(() => result.validateSync({ name: "to many characters" })).toThrowError("Name must have minimum 3 and maximum 10 characters");
    expect(() => result.validateSync({ name: "1234" })).toThrowError("Name must contain only letters");
    expect(() => result.validateSync({ age: 10 })).toThrowError("Minimum age is 21");
    expect(() => result.validateSync({ age: 200 })).toThrowError("Maximum age is 110");

    expect(result.isValidSync({ name: "Name", age: 30 })).toBe(true);
  });

  it.each([
    [{ user: { username: "", email: "email@test.com", address: { street: "street", city: "city" } } }, "Username cannot be blank"],
    [{ user: { username: "username", email: "invalid", address: { street: "street", city: "city" } } }, "Not a valid email"],
    [{ user: { username: "username", email: "email@test.com", address: { street: "", city: "city" } } }, "Street cannot be blank"],
    [{ user: { username: "username", email: "email@test.com", address: { street: "street", city: "" } } }, "City cannot be blank"],
  ])("should validate nested data: %p and return error: %p", (validationData: any, expectedMessage: string) => {
    // given
    const converter = new FormConfigurationValidationConverter();
    const nestedValidationList = createNestedValidationList();

    // when
    const result = converter.convertFormConfigurationToYupSchema(nestedValidationList);

    // then
    expect(result).toBeDefined();
    expect(() => result.validateSync(validationData)).toThrowError(expectedMessage);
  });

  it("should support custom constraints", () => {
    // given
    const converter = new FormConfigurationValidationConverter();
    const customValidationList = createCustomValidationList();

    // when
    const result = converter.convertFormConfigurationToYupSchema(customValidationList);

    // then
    expect(result).toBeDefined();
    expect(() => result.validateSync({ title: "other" })).toThrowError("Not in list: mr, mrs, miss");
    expect(result.isValidSync({ title: "mr" })).toBe(true);
  });
});
