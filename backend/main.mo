import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include components
  include MixinStorage();

  // Authorization system setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type UserProfile = {
    name : Text;
  };

  type BrandProfile = {
    name : Text;
    logo : Storage.ExternalBlob;
    tone : Text;
    audience : Text;
    categories : [Text];
    catalog : [Product];
  };

  type Product = {
    name : Text;
    category : Text;
    description : Text;
  };

  type SocialPost = {
    product : Product;
    platform : Text;
    caption : Text;
    hashtags : [Text];
    image : ?Storage.ExternalBlob;
  };

  type ScheduledPost = {
    post : SocialPost;
    brandId : Text;
    scheduledTime : Time.Time;
    status : PostStatus;
  };

  type PostStatus = {
    #draft;
    #scheduled;
    #published;
  };

  // Persistent state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let brandProfiles = Map.empty<Text, BrandProfile>();
  let brandOwners = Map.empty<Text, Principal>();
  let scheduledPosts = Map.empty<Text, ScheduledPost>();
  let postOwners = Map.empty<Text, Principal>();

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
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

  // ── Brand Profile Functions ─────────────────────────────────────────────────

  public shared ({ caller }) func createBrandProfile(brandId : Text, name : Text, logo : Storage.ExternalBlob, tone : Text, audience : Text, categories : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create brand profiles");
    };

    // Prevent overwriting a brand profile owned by someone else
    switch (brandOwners.get(brandId)) {
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Brand profile already exists and is owned by another user");
        };
      };
      case (null) {};
    };

    let profile : BrandProfile = {
      name;
      logo;
      tone;
      audience;
      categories;
      catalog = [];
    };
    brandProfiles.add(brandId, profile);
    brandOwners.add(brandId, caller);
  };

  public shared ({ caller }) func addProduct(brandId : Text, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };

    // Ownership check
    switch (brandOwners.get(brandId)) {
      case (null) { Runtime.trap("Brand profile not found") };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this brand profile");
        };
      };
    };

    switch (brandProfiles.get(brandId)) {
      case (null) { Runtime.trap("Brand profile not found") };
      case (?profile) {
        let updatedCatalog = profile.catalog.concat([product]);
        let updatedProfile = {
          name = profile.name;
          logo = profile.logo;
          tone = profile.tone;
          audience = profile.audience;
          categories = profile.categories;
          catalog = updatedCatalog;
        };
        brandProfiles.add(brandId, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getBrandProfile(brandId : Text) : async ?BrandProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view brand profiles");
    };

    // Only the owner or an admin can view the brand profile
    switch (brandOwners.get(brandId)) {
      case (null) { return null };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this brand profile");
        };
      };
    };

    brandProfiles.get(brandId);
  };

  // ── Simulated AI Content Generation ────────────────────────────────────────

  public shared ({ caller }) func generatePost(brandId : Text, productIdx : Nat, platform : Text) : async SocialPost {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate posts");
    };

    // Ownership check
    switch (brandOwners.get(brandId)) {
      case (null) { Runtime.trap("Brand profile not found") };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this brand profile");
        };
      };
    };

    let profile = switch (brandProfiles.get(brandId)) {
      case (null) { Runtime.trap("Brand profile not found") };
      case (?p) { p };
    };

    if (productIdx >= profile.catalog.size()) {
      Runtime.trap("Invalid product index");
    };

    let product = profile.catalog[productIdx];
    let tone = profile.tone;
    let category = product.category;

    let template = switch (category, tone) {
      case ("Jackets", "casual") { "Keep it cool and cozy with our new " # product.name # " jackets! Perfect for any adventure." };
      case ("Jackets", "luxury") { "Elevate your style with our exquisite " # product.name # ", crafted for the sophisticated taste." };
      case ("T-shirts", "streetwear") { "Turn heads with our fresh " # product.name # " tees. Street style for the bold." };
      case ("T-shirts", "casual") { "Stay comfy and stylish with our new " # product.name # " t-shirts. Perfect for everyday wear." };
      case (_, "casual") { "Check out our " # product.name # " collection! Stay comfortable, stay stylish." };
      case (_, "luxury") { "Experience luxury with our " # product.name # ". Premium quality for the discerning individual." };
      case (_, "streetwear") { "Make a statement with our " # product.name # ". Urban style redefined." };
      case (_, _) { "Discover our new " # product.name # " – where fashion meets function." };
    };

    let hashtags = switch (category, tone) {
      case ("Jackets", "casual") { ["#StayCozy", "#AdventureReady"] };
      case ("Jackets", "luxury") { ["#LuxuryFashion", "#ElegantStyle"] };
      case ("T-shirts", "streetwear") { ["#StreetStyle", "#BoldLook"] };
      case ("T-shirts", "casual") { ["#ComfyStyle", "#EverydayWear"] };
      case (_, "casual") { ["#Comfort", "#Style"] };
      case (_, "luxury") { ["#PremiumQuality", "#DiscerningTaste"] };
      case (_, "streetwear") { ["#UrbanStyle", "#StatementLook"] };
      case (_, _) { ["#FashionTrends", "#NewCollection"] };
    };

    {
      product;
      platform;
      caption = template;
      hashtags;
      image = ?profile.logo;
    };
  };

  // ── Content Scheduling Functions ────────────────────────────────────────────

  public shared ({ caller }) func schedulePost(brandId : Text, post : SocialPost, scheduledTime : Time.Time) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can schedule posts");
    };

    // Ownership check: caller must own the brand
    switch (brandOwners.get(brandId)) {
      case (null) { Runtime.trap("Brand profile not found") };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this brand profile");
        };
      };
    };

    let postId = brandId # "_" # Int.toText(scheduledTime);
    let scheduledPost : ScheduledPost = {
      post;
      brandId;
      scheduledTime;
      status = #scheduled;
    };
    scheduledPosts.add(postId, scheduledPost);
    postOwners.add(postId, caller);
    postId;
  };

  public query ({ caller }) func getScheduledPosts(brandId : Text) : async [ScheduledPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list posts");
    };

    // Only the brand owner or an admin can list posts for a brand
    switch (brandOwners.get(brandId)) {
      case (null) { return [] };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this brand profile");
        };
      };
    };

    scheduledPosts.values().toArray().filter(func(p : ScheduledPost) : Bool { p.brandId == brandId });
  };

  public shared ({ caller }) func updatePostStatus(postId : Text, status : PostStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update posts");
    };

    // Ownership check: caller must own the post
    switch (postOwners.get(postId)) {
      case (null) { Runtime.trap("Scheduled post not found") };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this post");
        };
      };
    };

    switch (scheduledPosts.get(postId)) {
      case (null) { Runtime.trap("Scheduled post not found") };
      case (?post) {
        let updatedPost = {
          post = post.post;
          brandId = post.brandId;
          scheduledTime = post.scheduledTime;
          status;
        };
        scheduledPosts.add(postId, updatedPost);
      };
    };
  };

  public shared ({ caller }) func deleteScheduledPost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    // Ownership check
    switch (postOwners.get(postId)) {
      case (null) { Runtime.trap("Scheduled post not found") };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this post");
        };
      };
    };

    scheduledPosts.remove(postId);
    postOwners.remove(postId);
  };
};
