# @mi-node-framework

This framework is a pack of my custom basic configuration setups for a quick build of services and APIs for short projects like hackathons, studies, challenges etc.

# Resources:

- [@mi-node-framework](#mi-node-framework)
- [Resources:](#resources)
  - [Dependency Injection](#dependency-injection)

## Dependency Injection

An abstraction class for an injection container for TypeScript using [TSyring](https://github.com/microsoft/tsyringe).

This abstraction allows me to use a dependency injection in a contract defined in this framework without having to know which is the main provider (TSyring).

In case I decide to use another controller of dependency injection, will make me easer to implement here and update the following services with the new @mi-node-framework version.
