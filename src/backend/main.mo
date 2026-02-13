import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type ModelId = Text;

  type ModelMetadata = {
    id : ModelId;
    name : Text;
    owner : Principal;
    timestamp : Int;
    totalInferenceCount : Nat;
    lastInferenceTime : Int;
    payloadSize : Nat;
    artifact : ?Storage.ExternalBlob;
  };

  let models = Map.empty<ModelId, ModelMetadata>();

  public type ModelInferenceArtifact = Storage.ExternalBlob;

  public type Model = {
    id : ModelId;
    name : Text;
    owner : Principal;
    artifact : ?ModelInferenceArtifact;
    timestamp : Int;
    totalInferenceCount : Nat;
    payloadSize : Nat;
    lastInferenceTime : Int;
  };

  public type ModelMetadataUpdate = {
    id : ModelId;
    name : Text;
    artifact : ?ModelInferenceArtifact;
    payloadSize : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyModels() : async [Model] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access models");
    };
    models.values().toArray().filter(
      func(m) {
        m.owner == caller;
      }
    ).map(
      func(m) {
        {
          id = m.id;
          name = m.name;
          owner = m.owner;
          artifact = m.artifact;
          timestamp = m.timestamp;
          totalInferenceCount = m.totalInferenceCount;
          payloadSize = m.payloadSize;
          lastInferenceTime = m.lastInferenceTime;
        };
      }
    );
  };

  public query ({ caller }) func getAdminModels() : async [Model] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access restricted models");
    };
    models.values().toArray().map(
      func(m) {
        {
          id = m.id;
          name = m.name;
          owner = m.owner;
          artifact = m.artifact;
          timestamp = m.timestamp;
          totalInferenceCount = m.totalInferenceCount;
          payloadSize = m.payloadSize;
          lastInferenceTime = m.lastInferenceTime;
        };
      }
    );
  };

  public query ({ caller }) func getModelById(modelId : ModelId) : async ?Model {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access models");
    };
    switch (models.get(modelId)) {
      case (?model) {
        if (
          model.owner == caller or
          AccessControl.isAdmin(accessControlState, caller)
        ) {
          ?{
            id = model.id;
            name = model.name;
            owner = model.owner;
            artifact = model.artifact;
            timestamp = model.timestamp;
            totalInferenceCount = model.totalInferenceCount;
            payloadSize = model.payloadSize;
            lastInferenceTime = model.lastInferenceTime;
          };
        } else {
          Runtime.trap("Unauthorized: Can only view your own models");
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func updateModelMetadata(modelUpdate : ModelMetadataUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update models");
    };
    switch (models.get(modelUpdate.id)) {
      case (?existingModel) {
        if (existingModel.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can update this model");
        };
        let updatedModel : ModelMetadata = {
          id = modelUpdate.id;
          name = modelUpdate.name;
          owner = caller;
          artifact = modelUpdate.artifact;
          timestamp = Time.now();
          totalInferenceCount = existingModel.totalInferenceCount;
          payloadSize = modelUpdate.payloadSize;
          lastInferenceTime = existingModel.lastInferenceTime;
        };
        models.add(modelUpdate.id, updatedModel);
      };
      case (null) {
        let newModel : ModelMetadata = {
          id = modelUpdate.id;
          name = modelUpdate.name;
          owner = caller;
          artifact = modelUpdate.artifact;
          timestamp = Time.now();
          totalInferenceCount = 0;
          payloadSize = modelUpdate.payloadSize;
          lastInferenceTime = 0;
        };
        models.add(modelUpdate.id, newModel);
      };
    };
  };

  public shared ({ caller }) func deleteModel(modelId : ModelId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete models");
    };
    switch (models.get(modelId)) {
      case (?model) {
        if (
          not AccessControl.isAdmin(accessControlState, caller) and model.owner != caller
        ) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this model");
        };
        models.remove(modelId);
      };
      case (null) { Runtime.trap("Model does not exist") };
    };
  };

  public query ({ caller }) func getModelStats() : async {
    totalModels : Nat;
    totalStorageUsed : Nat;
    totalInferenceCount : Nat;
    totalUsers : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };
    let values = models.values().toArray();
    let ownerKeys = models.values().toArray().map(func(m) { m.owner });

    let uniqueOwners = Set.empty<Principal>();
    ownerKeys.forEach(
      func(owner) {
        uniqueOwners.add(owner);
      }
    );

    {
      totalModels = models.size();
      totalStorageUsed = values.foldLeft(0, func(acc, m) { acc + m.payloadSize });
      totalInferenceCount = values.foldLeft(0, func(acc, m) { acc + m.totalInferenceCount });
      totalUsers = uniqueOwners.size();
    };
  };

  module Model {
    public func compareByInferenceCount(a : Model, b : Model) : Order.Order {
      Nat.compare(b.totalInferenceCount, a.totalInferenceCount);
    };
  };

  public query ({ caller }) func getMostPopularModels(limit : Nat) : async [Model] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view most popular models");
    };
    let popularModels = models.values().toArray().map(
      func(m) {
        {
          id = m.id;
          name = m.name;
          owner = m.owner;
          artifact = m.artifact;
          timestamp = m.timestamp;
          totalInferenceCount = m.totalInferenceCount;
          payloadSize = m.payloadSize;
          lastInferenceTime = m.lastInferenceTime;
        };
      }
    ).sort(Model.compareByInferenceCount);

    if (popularModels.size() > limit) {
      popularModels.sliceToArray(0, limit);
    } else {
      popularModels;
    };
  };

  public query ({ caller }) func getAvailableModels() : async [Model] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access models");
    };
    models.values().toArray().filter(
      func(m) {
        m.owner == caller or AccessControl.isAdmin(accessControlState, caller);
      }
    ).map(
      func(m) {
        {
          id = m.id;
          name = m.name;
          owner = m.owner;
          artifact = m.artifact;
          timestamp = m.timestamp;
          totalInferenceCount = m.totalInferenceCount;
          payloadSize = m.payloadSize;
          lastInferenceTime = m.lastInferenceTime;
        };
      }
    );
  };
};
