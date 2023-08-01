Feature: Basic logging test

Scenario: Logging a simple message
  Given I register an environment with the name "test"
  And I log "Hello World" using the "info" method and the environment "test"
  When I get the log history
  Then the log history should have 1 entries
  And the history entries should be:
    | original    | type  | env  |
    | Hello World | info  | test |

Scenario: Logging with multiple environments
  Given I register an environment with the name "test"
  And I register an environment with the name "test2"
  And I log "Hello World" using the "info" method and the environment "test"
  And I log "Hello World2" using the "log" method and the environment "test2"
  When I get the log history
  Then the log history should have 2 entries
  And the history entries should be:
    | original     | type  | env   |
    | Hello World  | info  | test  |
    | Hello World2 | log   | test2 |

Scenario: Logging with params
  Given I register an environment with the name "test"
  And I disable date-time
  And I disable padding
  And I log "Hello %s" using the "info" method and the environment "test" with the params:
    | param |
    | World |
  When I get the log history
  Then the log history should have 1 entries
  And the history entries should be:
    | formatted   | type  | env  |
    | Hello World | info  | test |

Scenario: Logging a dir
  Given I register an environment with the name "test"
  And I log "{ \"test\": 1 }" using the dir method and the environment "test"
  When I get the log history
  Then the log history should have 1 entries
  And the parsed history entries should be:
    | original      | type | env  |
    | { "test": 1 } | dir  | test |